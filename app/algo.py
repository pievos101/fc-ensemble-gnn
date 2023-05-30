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

    def readInputDataAndSetupSubNet(self, data_write_path: str, ppi_file_path: str, feats_file_path: list[str],
                                    target_file_path: str):
        self.g = gnn.GNNSubNet(data_write_path, ppi_file_path, feats_file_path, target_file_path)

    def splitSubNetIntoTrainAndTest(self, train_ratio: float):
        self.g_train, self.g_test = egnn.split(self.g, train_ratio)

    def trainClient(self, niter=1):
        # create local ensemble classier of client
        self.local_model = egnn.ensemble(self.g_train, niter=niter)
        # train local ensemble classier of client 1
        self.local_model.train()
        # self.prediction_model.grow(10) # greedy step

    def checkClientPerformance(self, output_dir_path: str = None):
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

        if output_dir_path:
            # save the values to a file
            with open(output_dir_path + '/client_performance.txt', 'w') as f:
                f.write(f'Balanced accuracy of ensemble classifier: {acc_bal}\n')
                f.write(f'Accuracy of ensemble classifier: {acc}\n')
                f.write(f'NMI of ensemble classifier: {nmi}\n')
                f.close()



    def saveGlobalModel(self, global_model:egnn.ensemble):
        self.global_model = global_model


    def testGlobalModelWithTestData(self, output_dir_path: str = None):
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

        if output_dir_path:
            # save the values to a file
            with open(output_dir_path + '/global_model_performance.txt', 'w') as f:
                f.write(f'Balanced accuracy of ensemble classifier: {acc_bal}\n')
                f.write(f'Accuracy of ensemble classifier: {acc}\n')
                f.write(f'NMI of ensemble classifier: {nmi}\n')
                f.close()


class Coordinator(Client):
    global_model: egnn.ensemble = None

    def aggregateClientModels(self, client_models: list[egnn.ensemble]):
        # aggregate the models from each client
        # without sharing any data
        self.global_model = egnn.aggregate(client_models)

