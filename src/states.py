import os
import time

import bios
from FeatureCloud.app.engine.app import AppState, app_state, Role

from algo import Coordinator, Client


class States:
    INITIAL = 'initial'  # setup the app
    LOCAL_TRAINING = 'local_training'  # train the local model and send it to the coordinator
    GLOBAL_AGGREGATION = 'global_aggregation'  # aggregate the local models and send the global model to the clients
    WAITING_FOR_GLOBAL_MODEL = 'waiting_for_global_model'  # wait for the global model from the coordinator and make predictions
    WEB_CONTROLLED = 'web_controlled'  # wait for the user to finish the analysis and listen for data from the ui
    WAITING_FOR_CLIENTS_TO_FINISH = 'waiting_for_clients_to_finish'  # wait for the clients to finish processing
    TERMINAL = 'terminal'  # finish the app


INPUT_DIR = 'mnt/input'
OUTPUT_DIR = 'mnt/output'

TERMINAL = False

# global instance to enable the communication between the states and the web api
local_model: Client = Client()
global_model: Client = Client()


def callback_fn_terminal_state():
    # is used to terminate from the web ui
    global TERMINAL
    print("Transition to terminal state triggered...")
    TERMINAL = True


@app_state(States.INITIAL)
class InitialState(AppState):

    def register(self):
        self.register_transition(States.LOCAL_TRAINING, role=Role.PARTICIPANT)
        self.register_transition(States.GLOBAL_AGGREGATION, role=Role.COORDINATOR)

    def run(self):
        if self.is_coordinator:
            self.log("Transitioning to AGGREGATE state")
            self.store('n_clients', len(self.clients) - 1)  # -1 because the coordinator is also a client
            return States.GLOBAL_AGGREGATION

        self.log("Reading config.yml")
        self.log(f"input dir{os.listdir(INPUT_DIR)})")
        config = bios.read(os.path.join(INPUT_DIR, 'config.yml'))
        self.log(f"input data. {config}")
        self.store('input_features_name', config['input_features_name'])
        self.store('input_ppi_name', config['input_ppi_name'])
        self.store('input_target_name', config['input_target_name'])
        self.store('wait_for_ui', config['wait_for_ui'])

        self.log("Finished reading config.yml")

        self.log("Transitioning to COMPUTE state")
        return States.LOCAL_TRAINING


# Client States
@app_state(name=States.LOCAL_TRAINING)
class ComputeState(AppState):

    def register(self):
        self.register_transition(States.WAITING_FOR_GLOBAL_MODEL)

    def run(self):
        # get input files and transfer them to a writeable directory
        self.log("Reading input data")
        input_ppi_name = self.load('input_ppi_name')
        input_features_name = self.load('input_features_name')
        input_target_name = self.load('input_target_name')
        # - input files
        ppi_path_input = os.path.join(INPUT_DIR, input_ppi_name)
        feats_path_input = os.path.join(INPUT_DIR, input_features_name)
        target_path_input = os.path.join(INPUT_DIR, input_target_name)

        # - output files
        ppi_path_output = os.path.join(OUTPUT_DIR, input_ppi_name)
        feats_path_output = os.path.join(OUTPUT_DIR, input_features_name)
        target_path_output = os.path.join(OUTPUT_DIR, input_target_name)

        # copy input files to output
        os.system(f"cp {ppi_path_input} {ppi_path_output}")
        os.system(f"cp {feats_path_input} {feats_path_output}")
        os.system(f"cp {target_path_input} {target_path_output}")

        time.sleep(2)  # A small delay to make sure the files are copied
        local_model.readInputDataAndSetupSubNet(OUTPUT_DIR, ppi_path_output, [feats_path_output], target_path_output)
        self.log("Generating train, validation and test data")
        local_model.splitSubNetIntoTrainAndTest()
        self.log("Training client")
        local_model.train()
        self.log("Sending local ensemble to coordinator")
        self.send_data_to_coordinator(local_model.ensemble)
        self.log("Finished sending local ensemble to coordinator")

        self.log("Testing client")
        local_model.checkValidationSetPerformance()
        local_model.checkTestSetPerformance()
        self.log("Finished testing client")
        return States.WAITING_FOR_GLOBAL_MODEL


@app_state(name=States.WAITING_FOR_GLOBAL_MODEL)
class WriteState(AppState):

    def register(self):
        self.register_transition(States.WEB_CONTROLLED)
        self.register_transition(States.TERMINAL)

    def run(self):
        self.log("Waiting for global model from coordinator")
        global_model.ensemble = self.await_data(n=1)
        self.log("Saving global model")
        self.log("Testing global model")
        # test on the same data as the local model
        global_model.validation_data = local_model.validation_data
        global_model.test_data = local_model.test_data
        global_model.checkValidationSetPerformance()
        global_model.checkTestSetPerformance()

        # if we are in ui mode we wait for the user to finish the analysis
        is_ui_mode = self.load('wait_for_ui')
        if is_ui_mode:
            return States.WEB_CONTROLLED
        else:
            local_model.savePerformanceToFile(OUTPUT_DIR, 'local_performance.txt')
            global_model.savePerformanceToFile(OUTPUT_DIR, 'global_performance.txt')

        # if we are not in ui mode we tell the coordinator that we are finished and terminate
        self.send_data_to_coordinator("finished")
        self.log("Transitioning to TERMINAL state")
        return States.TERMINAL


@app_state(name=States.WEB_CONTROLLED)
class WebControlledState(AppState):

    def register(self):
        self.register_transition(States.TERMINAL)
        self.register_transition(States.WEB_CONTROLLED)

    def run(self):
        # we wait for the user to finish the analysis
        if TERMINAL:
            self.send_data_to_coordinator("finished")
            self.log("Web Analysis finished. Transitioning to TERMINAL state")
            return States.TERMINAL
        else:
            return States.WEB_CONTROLLED


# COORDINATOR STATES
@app_state(name=States.GLOBAL_AGGREGATION)
class AggregateState(AppState):

    def register(self):
        self.register_transition(States.WAITING_FOR_CLIENTS_TO_FINISH)

    def run(self):
        self.log("Transitioning to WAITING_FOR_PROCESSING state")
        coordinator = Coordinator()
        number_of_clients = self.load('n_clients')
        self.log(f"Waiting for data from n={number_of_clients} clients")
        client_models = self.await_data(n=number_of_clients)
        self.log("Aggregating data")
        coordinator.aggregateClientModels(client_models)
        global_model.ensemble = coordinator.ensemble
        self.log("sending global model to clients")
        self.broadcast_data(global_model.ensemble, send_to_self=False)

        return States.WAITING_FOR_CLIENTS_TO_FINISH


@app_state(name=States.WAITING_FOR_CLIENTS_TO_FINISH)
class WaitingForProcessingState(AppState):

    def register(self):
        self.register_transition(States.TERMINAL)

    def run(self):
        self.log("Waiting for clients to finish processing")
        n_clients = self.load('n_clients')
        client_feedback: list[str] = self.await_data(n=n_clients)
        # check if all clients have send 'finished' with their id
        if client_feedback.count("finished") == n_clients:
            self.log("All clients finished. Transitioning to TERMINAL state")
            return States.TERMINAL
        else:
            self.log("Not all clients finished. Waiting for the remaining clients to finish")
            self.log(f"Received feedback from clients: {client_feedback}")
            return States.WAITING_FOR_CLIENTS_TO_FINISH
