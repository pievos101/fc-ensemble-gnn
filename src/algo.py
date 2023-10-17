# import GNNSubNet
from GNNSubNet import GNNSubNet as gnn
# import ensemble_gnn
import ensemble_gnn as egnn
from sklearn.metrics import balanced_accuracy_score
from sklearn.metrics import accuracy_score
from sklearn.metrics.cluster import normalized_mutual_info_score
from pickle import dump
from typing import Union


def getGraphs(model: egnn.ensemble) -> list[list[Union[list[Union[int, str]], int]]]:
    # get the graphs from the model
    # and convert them to a list of lists
    graph = []
    for i in range(0, len(model.ensemble)):
        tensor_sub_graph = model.get_graph(i)
        sub_graph: list[list[Union[int, str]]] = []
        for j in range(0, len(tensor_sub_graph)):
            sub_graph.append(tensor_sub_graph[j].tolist())
        graph.append(sub_graph)
    return graph


class Client:
    local_model: egnn.ensemble = None
    global_model: egnn.ensemble = None
    g: gnn.GNNSubNet = None
    g_train: gnn.GNNSubNet = None
    g_validate: gnn.GNNSubNet = None
    g_test: gnn.GNNSubNet = None
    status: str = "No data"
    ensemble_validation_performance: int = 0
    ensemble_test_performance: int = 0

    def __init__(self):
        pass

    def readInputDataAndSetupSubNet(self, data_write_path: str, ppi_file_path: str, feats_file_path: list[str],
                                    target_file_path: str):
        self.status = "Loading data"
        self.g = gnn.GNNSubNet(data_write_path, ppi_file_path, feats_file_path, target_file_path)
        self.status = "Data loaded"

    def splitSubNetIntoTrainAndTest(self, train_ratio: float, test_ratio: float = 0.5):
        self.status = "Preparing data"
        self.g_train, validate_test = egnn.split(self.g, train_ratio)
        self.g_validate, self.g_test = egnn.split(validate_test, test_ratio)
        self.status = "Data prepared"

    def trainClient(self, niter=1):
        self.status = "Training client"
        # create local ensemble classier of client
        self.local_model = egnn.ensemble(self.g_train, niter=niter)
        # train local ensemble classier of client 1
        self.local_model.train()
        # self.prediction_model.grow(10) # greedy step
        self.status = "Client trained"

    def saveClientModelToFile(self, output_dir_path: str):
        file_name = output_dir_path + '/client_model.json'
        with open(file_name, 'wb') as f:
            dump(self.local_model, f)
            f.close()

    def checkClientPerformance(self, data_to_test):
        # Lets check the client-specific performances
        p_predicted_class = self.local_model.predict(data_to_test)
        acc = accuracy_score(self.g_test.true_class, p_predicted_class)
        acc_bal = balanced_accuracy_score(self.g_test.true_class, p_predicted_class)
        nmi = normalized_mutual_info_score(self.g_test.true_class, p_predicted_class)

        print("\n-----------")
        print(f'Balanced accuracy of ensemble classifier:', acc_bal)
        print(f'Accuracy of ensemble classifier:', acc)
        print("\n-----------")
        print(f'NMI of ensemble classifier:', nmi)

        return acc_bal, acc, nmi

    def measurePerformance(self, output_dir_path: str = None):
        self.status = "Testing client"
        # Lets check the client-specific performances
        test_acc_bal, test_acc, test_nmi = self.checkClientPerformance(self.g_test)
        validate_acc_bal, validate_acc, validate_nmi = self.checkClientPerformance(self.g_validate)

        if output_dir_path:
            # save the values to a file
            with open(output_dir_path + '/client_performance.txt', 'w') as f:
                f.write(f'Balanced accuracy of ensemble classifier: {validate_acc_bal}\n')
                f.write(f'Accuracy of ensemble classifier: {validate_acc}\n')
                f.write(f'NMI of ensemble classifier: {validate_nmi}\n')
                f.close()
        self.status = "Client tested"

    def saveGlobalModel(self, global_model:egnn.ensemble):
        self.global_model = global_model

    def testGlobalModelWithTestData(self, output_dir_path: str = None):
        self.status = "Testing global model"
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
        self.status = "Global model tested"


class Coordinator(Client):
    global_model: egnn.ensemble = None

    def aggregateClientModels(self, client_models: list[gnn.GNNSubNet]):
        # aggregate the models from each client
        # without sharing any data
        self.global_model = egnn.aggregate(client_models)

