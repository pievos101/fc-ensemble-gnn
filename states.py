import time

import bios
import os
from FeatureCloud.app.engine.app import AppState, app_state, Role
from app.algo import Coordinator, Client


class States:
    INITIAL = 'initial'
    COMPUTE = 'compute'
    AGGREGATE = 'aggregate'
    WAITING_FOR_PROCESSING = 'waiting_for_processing'
    WRITE = 'write'
    TERMINAL = 'terminal'


INPUT_DIR = 'app/data/client1'
DATA_DIR = 'GNN-SubNet/TCGA'
OUTPUT_DIR = 'mnt/output'


@app_state(States.INITIAL)
class InitialState(AppState):

    def register(self):
        self.register_transition(States.COMPUTE, role=Role.PARTICIPANT)
        self.register_transition(States.AGGREGATE, role=Role.COORDINATOR)

    def run(self):
        self.log("Reading config.yml")
        self.log(f"input dir{os.listdir(INPUT_DIR)})")
        config = bios.read(os.path.join(INPUT_DIR, 'config.yml'))
        self.log(f"input data. {config}")
        self.store('input_features_name', config['input_features_name'])
        self.store('input_ppi_name', config['input_ppi_name'])
        self.store('input_target_name', config['input_target_name'])

        self.log("Finished reading config.yml")

        if self.is_coordinator:
            self.log("Transitioning to AGGREGATE state")
            self.store('n_clients', len(self.clients) - 1)  # -1 because the coordinator is also a client
            return States.AGGREGATE
        else:
            self.log("Transitioning to COMPUTE state")
            return States.COMPUTE


@app_state(States.COMPUTE)
class ComputeState(AppState):

    def register(self):
        self.register_transition(States.WRITE)

    def run(self):
        self.log("Reading input data")
        input_features_name = self.load('input_features_name')
        input_ppi_name = self.load('input_ppi_name')
        input_target_name = self.load('input_target_name')
        #input files
        ppi_path_input = os.path.join(DATA_DIR, input_ppi_name)
        feats_path_input = os.path.join(DATA_DIR, input_features_name)
        target_path_input = os.path.join(DATA_DIR, input_target_name)

        client = Client()
        client.readInputDataAndSetupSubNet(DATA_DIR, ppi_path_input, [feats_path_input], target_path_input)
        self.log("Generating test and train data")
        client.splitSubNetIntoTrainAndTest(0.8)
        self.log("Training client")
        client.trainClient()
        self.log("Testing client")
        client.checkClientPerformance()
        self.log("Saving client")
        self.store('client', client)
        self.log("Sending data to coordinator")
        self.send_data_to_coordinator(client)
        self.log("Finished sending data to coordinator")

        self.log("Transitioning to WRITE state")
        return States.WRITE


@app_state(States.AGGREGATE)
class AggregateState(AppState):

    def register(self):
        self.register_transition(States.WAITING_FOR_PROCESSING)

    def run(self):
        self.log("Transitioning to WAITING_FOR_PROCESSING state")
        coordinator = Coordinator()
        number_of_clients = self.load('n_clients')
        self.log(f"Waiting for data from n={number_of_clients} clients")
        client_models = self.await_data(n=number_of_clients)
        self.log("Aggregating data")
        coordinator.aggregateClientModels(client_models)
        global_model = coordinator.global_model
        self.log("sending global model to clients")
        self.broadcast_data(global_model, send_to_self=False)

        return States.WAITING_FOR_PROCESSING


@app_state(States.WAITING_FOR_PROCESSING)
class WaitingForProcessingState(AppState):

        def register(self):
            self.register_transition(States.TERMINAL)

        def run(self):
            self.log("Waiting for clients to finish processing")
            n_clients = self.load('n_clients')
            client_feedback: list[str] = self.await_data(n=n_clients)
            self.log(f"Received feedback from clients: {client_feedback}")
            self.log("Transitioning to Terminal state as all clients have finished processing")
            return States.TERMINAL


@app_state(States.WRITE)
class WriteState(AppState):

    def register(self):
        self.register_transition(States.TERMINAL)

    def run(self):
        self.log("Waiting for global model from coordinator")
        global_model = self.await_data(n=1)[0]
        self.log("Writing global model to output")
        client: Client = self.load('client')
        client.saveGlobalModel(global_model)
        self.log("Finished writing global model to output")
        client.testGlobalModelWithTestData(OUTPUT_DIR)
        self.log("Transitioning to TERMINAL state")
        self.send_data_to_coordinator('done')
        return States.TERMINAL
