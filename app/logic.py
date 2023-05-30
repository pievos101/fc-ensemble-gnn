import os.path

import jsonpickle
import threading
import time
import yaml
import shutil

from app.algo import Coordinator, Client


class AppLogic:
    def __init__(self):
        # === Status of this app instance ===

        # Indicates whether there is data to share, if True make sure self.data_out is available
        self.status_available = False

        # Only relevant for coordinator, will stop execution when True
        self.status_finished = False

        # === Parameters set during setup ===
        self.id = None
        self.isCoordinator = False
        self.coordinator = None
        self.clientIds = None

        # === Data ===
        self.data_incoming = []
        self.data_outgoing = None

        # === Internals ===
        self.thread = None
        self.iteration = 0
        self.progress = 'not started yet'

        # === Custom ===
        self.INPUT_DIR = "/mnt/input"
        self.OUTPUT_DIR = "/mnt/output"

        self.data_name = None

        self.client = None

        # === input files ===
        self.input_features_name = None
        self.input_ppi_name = None
        self.input_target_name = None

    def handle_setup(self, client_id, coordinator, clients):
        # This method is called once upon startup and contains information about the execution context of this instance
        self.id = client_id
        self.isCoordinator = coordinator
        self.clientIds = clients
        print(f'Received setup: {self.id} {self.isCoordinator} {self.clientIds}', flush=True)

        self.thread = threading.Thread(target=self.app_flow)
        self.thread.start()

    def handle_incoming(self, data):
        # This method is called when new data arrives
        print("Process incoming data....", flush=True)
        self.data_incoming.append(data.read())

    def handle_outgoing(self):
        print("Process outgoing data...", flush=True)
        # This method is called when data is requested
        self.status_available = False
        return self.data_outgoing

    def read_config(self):
        with open(self.INPUT_DIR + '/config.yml') as f:
            config = yaml.load(f, Loader=yaml.FullLoader)['fc_ensemble_gnn']
            self.input_features_name = config['input_features_name']
            self.input_ppi_name = config['input_ppi_name']
            self.input_target_name = config['input_target_name']
            # print config
            print(f"config: {str(config)}", flush=True)
        shutil.copyfile(self.INPUT_DIR + "/config.yml", self.OUTPUT_DIR + "/config.yml")

    def app_flow(self):
        # This method contains a state machine for the client and coordinator instance

        # === States ===
        state_initializing = 1
        state_read_input = 2
        state_training_local_model = 6
        state_wait_for_aggregation = 7
        state_global_aggregation = 8
        state_writing_results = 9
        state_finishing = 10

        # Initial state
        state = state_initializing
        self.progress = 'initializing...'

        while True:
            if state == state_initializing:
                print("Initializing", flush=True)
                if self.id is not None:  # Test if setup has happened already
                    print(f'Coordinator: {self.isCoordinator}', flush=True)
                    if self.isCoordinator:
                        # the coordinator has nothing to do except waiting for the data
                        self.coordinator = Coordinator()
                        state = state_global_aggregation
                    else:
                        self.client = Client()
                        state = state_read_input

            if state == state_read_input:
                print("Read input", flush=True)
                self.progress = 'read input'
                self.read_config()

                #input files
                ppi_path_input = os.path.join(self.INPUT_DIR, self.input_ppi_name)
                feats_path_input = os.path.join(self.INPUT_DIR, self.input_features_name)
                target_path_input = os.path.join(self.INPUT_DIR, self.input_target_name)
                #output files
                ppi_path_output = os.path.join(self.OUTPUT_DIR, self.input_ppi_name)
                feats_path_output = os.path.join(self.OUTPUT_DIR, self.input_features_name)
                target_path_output = os.path.join(self.OUTPUT_DIR, self.input_target_name)

                # copy files to output dir, because GNN needs to write to the same dir and the input dir is read-only
                shutil.copyfile(ppi_path_input, ppi_path_output)
                shutil.copyfile(feats_path_input, feats_path_output)
                shutil.copyfile(target_path_input, target_path_output)

                self.client.readInputDataAndSetupSubNet(self.OUTPUT_DIR, ppi_path_output, [feats_path_output], target_path_output)
                if self.isCoordinator:
                    state = state_global_aggregation
                else:
                    state = state_training_local_model

            if state == state_training_local_model:
                print("Local training with feature set", flush=True)
                self.progress = 'client local training'
                self.client.splitSubNetIntoTrainAndTest(0.8)
                self.client.trainClient()
                self.client.checkClientPerformance()
                data_to_send = jsonpickle.encode(self.client.local_model)
                self.data_outgoing = data_to_send
                self.status_available = True
                state = state_wait_for_aggregation
                print(f'[CLIENT] Sending local prediction model to coordinator', flush=True)

            if state == state_wait_for_aggregation:
                print("Wait for aggregation", flush=True)
                self.progress = 'wait for aggregation'
                if len(self.data_incoming) > 0:
                    print("Received global prediction model from coordinator.", flush=True)
                    global_prediction_model = jsonpickle.decode(self.data_incoming[0])
                    print("Global prediction model:", self.data_incoming, flush=True)
                    self.client.saveGlobalModel(global_prediction_model)
                    # create a json file to store the global model
                    global_model_path = os.path.join(self.OUTPUT_DIR, 'global_model.json')
                    with open(global_model_path, 'wb') as f:
                        f.write(self.data_incoming[0])
                    state = state_writing_results
                    self.data_incoming = []

            # GLOBAL PART, this should be done by the coordinator
            if state == state_global_aggregation:
                print("Global computation", flush=True)
                self.progress = 'global aggregation...'
                # clients.length -1 because the coordinator is also in the list of clients
                if len(self.data_incoming) == len(self.clientIds) - 1:
                    print("Received all local prediction models from clients.", flush=True)
                    print("Local prediction models:", self.data_incoming, flush=True)
                    local_prediction_models = [jsonpickle.decode(client_data) for client_data in self.data_incoming]
                    self.data_incoming = []
                    self.coordinator.aggregateClientModels(local_prediction_models)
                    self.coordinator.global_model = self.coordinator.global_model
                    data_to_broadcast = jsonpickle.encode(self.coordinator.global_model)
                    self.data_outgoing = data_to_broadcast
                    self.status_available = True
                    state = state_writing_results
                    print(f'[COORDINATOR] Broadcasting global_model to clients', flush=True)

            if state == state_writing_results:
                print("Writing results", flush=True)
                self.progress = 'Storing global model on client...'
                # now you can save it to a file
                self.client.testGlobalModelWithTestData()
                state = state_finishing

            if state == state_finishing:
                print("Finishing", flush=True)
                self.progress = 'finishing...'
                if self.isCoordinator:
                    time.sleep(10)
                self.status_finished = True
                break

            time.sleep(1)


logic = AppLogic()
