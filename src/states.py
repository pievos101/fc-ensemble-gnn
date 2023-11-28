import os
import time
from typing import Union

import bios
from FeatureCloud.app.engine.app import AppState, app_state, Role

from algo import Coordinator, Client


class States:
    INITIAL = 'initial'  # setup the app
    LOCAL_TRAINING = 'local_training'  # train the local model and send it to the coordinator
    WAITING_FOR_GLOBAL_MODEL = 'waiting_for_global_model'  # wait for the global model from the coordinator and make predictions
    WEB_CONTROLLED = 'web_controlled'  # wait for the user to finish the analysis and listen for data from the ui
    DISTRIBUTE_WEIGHTS = 'distribute_weights'  # distribute the weights to the clients
    WAITING_FOR_GLOBAL_WEIGHTS = 'waiting_for_global_weights'  # wait for the global weights from the coordinator
    GLOBAL_MODEL_AGGREGATION = 'global_model_aggregation'  # aggregate the local models and send the global model to the clients
    GLOBAL_WEIGHT_AGGREGATION = 'global_weight_aggregation'  # aggregate the global weights and send them to the clients
    WAITING_FOR_CLIENTS_TO_FINISH = 'waiting_for_clients_to_finish'  # wait for the clients to finish processing
    TERMINAL = 'terminal'  # finish the app


INPUT_DIR = 'mnt/input'
OUTPUT_DIR = 'mnt/output'

TERMINAL = False
distribute_weights = False

# global instance to enable the communication between the states and the web api
local_model: Client = Client()
global_model: Client = Client(init_empty=True)


def callback_fn_terminal_state():
    # is used to terminate from the web ui
    global TERMINAL
    print("Transition to terminal state triggered...")
    TERMINAL = True


def start_weight_distribution():
    # is used to terminate from the web ui
    global distribute_weights
    print("Starting weight distribution triggered...")
    distribute_weights = True


@app_state(States.INITIAL)
class InitialState(AppState):

    def register(self):
        self.register_transition(States.LOCAL_TRAINING, role=Role.PARTICIPANT)
        self.register_transition(States.GLOBAL_MODEL_AGGREGATION, role=Role.COORDINATOR)

    def run(self):
        if self.is_coordinator:
            self.log("Transitioning to AGGREGATE state")
            local_model.is_coordinator = True
            self.store('n_clients', len(self.clients) - 1)  # -1 because the coordinator is also a client
            return States.GLOBAL_MODEL_AGGREGATION

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
        # send only the ensemble to the coordinator, without the training data
        self.send_data_to_coordinator(local_model.getSendAbleEnsemble())
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
        received_ensemble: list = self.await_data()
        self.log(f"Received Global model length: {len(received_ensemble)}")
        # add all ensembles to the global model, each at a time

        for ensemble_el in received_ensemble:
            global_model.ensemble.add(ensemble_el)
        global_model.training_complete = True
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
        self.register_transition(States.DISTRIBUTE_WEIGHTS)

    def run(self):
        # we wait for the user to finish the analysis
        if TERMINAL:
            self.send_data_to_coordinator("finished")
            local_model.savePerformanceToFile(OUTPUT_DIR, 'local_performance.txt')
            global_model.savePerformanceToFile(OUTPUT_DIR, 'global_performance.txt')
            self.log("Web Analysis finished. Transitioning to TERMINAL state")
            return States.TERMINAL
        elif distribute_weights:
            return States.DISTRIBUTE_WEIGHTS
        else:
            return States.WEB_CONTROLLED


@app_state(name=States.DISTRIBUTE_WEIGHTS)
class DistributeWeightsState(AppState):

    def register(self):
        self.register_transition(States.WAITING_FOR_GLOBAL_WEIGHTS)

    def run(self):
        self.log("Distributing weights coordinator")
        self.send_data_to_coordinator(global_model.weight_configuration, send_to_self=False)
        self.log("Finished distributing weights coordinator")
        return States.WAITING_FOR_GLOBAL_WEIGHTS


@app_state(name=States.WAITING_FOR_GLOBAL_WEIGHTS)
class WeightForGlobalWeightsState(AppState):

    def register(self):
        self.register_transition(States.WEB_CONTROLLED)

    def run(self):
        self.log("Waiting for global weights from coordinator")
        received_weights: list[int] = self.await_data()
        self.log(f"Received Global weights length: {len(received_weights)}")
        global_model.aggregated_weight_configuration = received_weights
        global distribute_weights
        distribute_weights = False
        return States.WEB_CONTROLLED


# COORDINATOR STATES
@app_state(name=States.GLOBAL_MODEL_AGGREGATION)
class AggregateState(AppState):

    def register(self):
        self.register_transition(States.WAITING_FOR_CLIENTS_TO_FINISH)

    def run(self):
        self.log("Transitioning to WAITING_FOR_PROCESSING state")
        coordinator = Coordinator()
        # await data
        number_of_clients = self.load('n_clients')
        self.log(f"Waiting for data from n={number_of_clients} clients")
        client_models = self.await_data(n=number_of_clients)

        # aggregate the models
        self.log(f"Aggregating {len(client_models)} models")
        coordinator.aggregateClientModels(client_models)

        # distribute the global model to the clients
        global_model.ensemble = coordinator.ensemble
        self.log(f"sending global model with {len(coordinator.ensemble.ensemble)} ensembles to clients")
        self.broadcast_data(coordinator.getSendAbleEnsemble(), send_to_self=False)

        return States.WAITING_FOR_CLIENTS_TO_FINISH


@app_state(name=States.WAITING_FOR_CLIENTS_TO_FINISH)
class WaitingForProcessingState(AppState):

    def register(self):
        self.register_transition(States.TERMINAL)
        self.register_transition(States.GLOBAL_WEIGHT_AGGREGATION)

    def run(self):
        self.log("Waiting for clients to finish processing")
        n_clients = self.load('n_clients')
        client_feedback: list[Union[list[int], str]] = self.await_data(n=n_clients)

        finished_clients = client_feedback.count("finished")
        # check if all clients have send 'finished' and if so transition to terminal state
        if finished_clients == n_clients:
            self.log("All clients finished. Transitioning to TERMINAL state")
            return States.TERMINAL
        # if not all clients have finished, continue with the weight aggregation with the remaining clients
        else:
            n_clients = n_clients - finished_clients
            self.store('n_clients', n_clients)
            self.log(f"{finished_clients} clients have terminated")
            self.log(f"Remaining n={n_clients} clients")

            # get the data from all clients, that have sent a list of numbers to have a list of lists of numbers
            client_weights: list[list[int]] = [weight_config for weight_config in client_feedback if
                                               isinstance(weight_config, list)]

            self.store('client_weights', client_weights)
            self.log(f"Received weight configurations from clients: {len(client_weights)}")
            return States.GLOBAL_WEIGHT_AGGREGATION


@app_state(name=States.GLOBAL_WEIGHT_AGGREGATION)
class WaitingForProcessingState(AppState):

    def register(self):
        self.register_transition(States.WAITING_FOR_CLIENTS_TO_FINISH)

    def run(self):
        self.log("Waiting for clients to finish processing")
        n_clients = self.load('n_clients')
        weights: list[list[int]] = self.load('client_weights')

        if n_clients != len(weights):
            self.log(f"n_clients={n_clients} != len(weights)={len(weights)}")
            # NOTE: this should never happen
            return States.WAITING_FOR_CLIENTS_TO_FINISH

        # all clients should have the same number of weights, but just to be sure
        # check if all clients have the same number of weights, if not fill the missing weights with 1 = neutral
        max_weight_length = max([len(weight) for weight in weights])
        for weight in weights:
            if len(weight) < max_weight_length:
                weight.extend([1 for _ in range(max_weight_length - len(weight))])

        # aggregate the weights
        # Make an average where the first weight is the average of the first weights of all clients, etc.
        global_weights: list[float] = []
        for i in range(max_weight_length):
            global_weights.append(sum([weight[i] for weight in weights]) / len(weights))

        # round the weights to the nearest integer
        global_weights = [round(weight) for weight in global_weights]

        self.log(f"Global weights: {global_weights}")
        self.log(f"Sending global weights to clients")
        self.broadcast_data(global_weights, send_to_self=False)
        self.log(f"Finished sending global weights to clients")

        return States.WAITING_FOR_CLIENTS_TO_FINISH
