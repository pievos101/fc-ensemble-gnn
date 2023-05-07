# import GNNSubNet
from GNNSubNet import GNNSubNet as gnn
# import ensemble_gnn
import ensemble_gnn as egnn
from sklearn.metrics import balanced_accuracy_score
from sklearn.metrics import accuracy_score
from sklearn.metrics.cluster import normalized_mutual_info_score

from GNNSubNet.GNNSubNet import GNNSubNet

class Client:
    local_model: egnn.ensemble = None
    global_model: egnn.ensemble = None
    g: GNNSubNet = None
    g_train: GNNSubNet = None
    g_test: GNNSubNet = None

    def __init__(self):
        pass

    def readInputDataAndSetupSubNet(self, data_root_path: str, ppi_file_name: str, feats_file_name: str,
                                    output_file_name: str):
        self.g = gnn.GNNSubNet(data_root_path, ppi_file_name, feats_file_name, output_file_name)

    def splitSubNetIntoTrainAndTest(self, train_ratio: float):
        self.g_train, self.g_test = egnn.split(self.g, train_ratio)

    def trainClient(self, niter=1):
        # create local ensemble classier of client
        self.local_model = egnn.ensemble(self.g_train, niter=niter)
        # train local ensemble classier of client 1
        self.local_model.train()
        # self.prediction_model.grow(10) # greedy step

    def checkClientPerformance(self):
        # Lets check the client-specific performances
        p_predicted_class = self.local_model.predict(self.g_test)
        acc = accuracy_score(self.g_test.true_class, p_predicted_class)
        acc_bal = balanced_accuracy_score(self.g_test.true_class, p_predicted_class)
        nmi = normalized_mutual_info_score(self.g_test.true_class, p_predicted_class)

        print("\n-----------")
        print(f'Balanced accuracy of ensemble classifier:', acc_bal)
        print(f'Accuracy of ensemble classifier:', acc)
        print("\n-----------")
        print(f'NMI of ensemble classifier:', nmi)

    def saveGlobalModel(self, global_model):
        self.global_model = global_model

    def testGlobalModelWithTestData(self):
        # Make predictions using the global model via Majority Vote
        predicted_class = self.global_model.predict(self.g_test)
        # Lets check the performance of the federated ensemble classifier
        acc = accuracy_score(self.g_test.true_class, predicted_class)
        acc_bal = balanced_accuracy_score(self.g_test.true_class, predicted_class)
        print("\n-----------")
        print("Balanced accuracy of global ensemble classifier:", acc_bal)
        print("Accuracy of global ensemble classifier:", acc)
        nmi = normalized_mutual_info_score(self.g_test.true_class, predicted_class)

        print("\n-----------")
        print("NMI of global ensemble classifier:", nmi)

class Coordinator(Client):
    global_model: egnn.ensemble = None

    def aggregateModels(self, clients):
        # aggregate the models from each client
        # without sharing any data
        self.global_model = egnn.aggregate(clients)
