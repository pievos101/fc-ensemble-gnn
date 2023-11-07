import os

from GNNSubNet import GNNSubNet as gnn
import ensemble_gnn as egnn
from sklearn.metrics import balanced_accuracy_score
from sklearn.metrics import accuracy_score
from sklearn.metrics.cluster import normalized_mutual_info_score
from pickle import dump
from typing import Union


def getGraphs(model: egnn.ensemble) -> list[list[Union[list[Union[Union[int, str], float]], int]]]:
    """Get the knowledge graphs from the ensembles

    Converts the tensor graphs to a native lists
    :param model: the ensemble model
    :return: list of graphs containing [[node1_idx], [node2_idx], nodes, performance]
    """
    graph = []
    # iterate over all ensemble classifiers
    for i in range(0, len(model.ensemble)):
        # extract the tensor graph
        tensor_sub_graph = model.get_graph(i)
        sub_graph: list[list[Union[int, str]]] = []
        # convert the tensor graph to a native list
        for j in range(0, len(tensor_sub_graph)):
            sub_graph.append(tensor_sub_graph[j].tolist())

        subnet: gnn.GNNSubNet = model.ensemble[i]
        # get the node weights from the subnet of the ensemble classifier
        transformed_node_mask = []
        for node in subnet.node_mask:
            # convert float 32 to float to make it json serializable
            transformed_node_mask.append(float(node))

        # get the edge weights from the subnet of the ensemble classifier
        transformed_edge_mask = []
        for edge in subnet.edge_mask:
            # convert float 32 to float to make it json serializable
            transformed_edge_mask.append(float(edge[0]))  # convert the list with one element to a single float

        # add the node and edge weights to the graph data
        sub_graph.append(transformed_node_mask)
        sub_graph.append(transformed_edge_mask)
        graph.append(sub_graph)
    return graph


class PerformanceResult:
    nmi: int = 0
    acc: int = 0
    acc_bal: int = 0

    def __init__(self, acc, acc_bal, nmi):
        self.nmi = nmi
        self.acc = acc
        self.acc_bal = acc_bal


class Client:
    """
    This class represents a client in the federated learning process.

    It contains the data, the model and the performance of the client.

    An external model can be loaded into the client and the performance can be computed.
    """
    ensemble: egnn.ensemble = None

    data: gnn.GNNSubNet = None
    training_data: gnn.GNNSubNet = None
    validation_data: gnn.GNNSubNet = None
    test_data: gnn.GNNSubNet = None

    status: str = "No data"
    training_complete: bool = False
    ensemble_validation_performance: PerformanceResult = None
    ensemble_test_performance: PerformanceResult = None

    def __init__(self, init_empty: bool = False):
        if init_empty:
            self.ensemble = egnn.ensemble()

    def getSendAbleEnsemble(self):
        """
        Returns the ensemble in a detached and sendable format
        Removes the training data from the ensemble
        :return: the ensemble
        """
        return self.ensemble.send_model()

    def readInputDataAndSetupSubNet(self, data_write_path: str, ppi_file_path: str, feats_file_path: list[str],
                                    target_file_path: str):
        self.status = "Loading data"
        self.data = gnn.GNNSubNet(data_write_path, ppi_file_path, feats_file_path, target_file_path)
        self.status = "Data loaded"

    def splitSubNetIntoTrainAndTest(self, train_ratio: float = 0.8, test_ratio: float = 0.5):
        self.status = "Preparing data"
        self.training_data, self.validation_data, self.test_data = egnn.split_n(self.data, 3, [0.8, 0.1, 0.1])
        self.status = "Data prepared"

    def train(self, niter=1):
        self.status = "Training client"
        # create local ensemble classier of client
        self.ensemble = egnn.ensemble(self.training_data, niter=niter)
        # train local ensemble classier
        self.ensemble.train()
        # explain the ensemble and generate the edge_mask and node_mask
        self.ensemble.explain()

        self.training_complete = True
        self.status = "Client trained"

    def saveClientModelToFile(self, output_dir_path: str, file_name: str = 'client_model.json'):
        file_name = os.path.join(output_dir_path, file_name)
        with open(file_name, 'wb') as f:
            dump(self.ensemble, f)
            f.close()

    def __checkPerformance(self, data_to_test, weights: list[int] = None, data_name: str = "data set"):
        # Lets check the client-specific performance
        p_predicted_class = self.ensemble.predict(data_to_test)
        if weights is not None and len(weights) > 0:
            if len(weights) != len(self.ensemble.ensemble):
                print(f'Number of weights: {len(weights)}')
                print(f'Number of ensemble classifiers: {len(self.ensemble.ensemble)}')
                raise Exception('The number of weights must match the number of ensemble classifiers')
            print(f'Using weights: {weights}')
            p_predicted_class = self.ensemble.weightedVote(weights)
        print("\n-----------")
        print(f'Performance on {data_name}:')
        acc = accuracy_score(data_to_test.true_class, p_predicted_class)
        print(f'Accuracy of ensemble classifier:', acc)
        acc_bal = balanced_accuracy_score(data_to_test.true_class, p_predicted_class)
        print(f'Balanced accuracy of ensemble classifier:', acc_bal)
        nmi = normalized_mutual_info_score(data_to_test.true_class, p_predicted_class)
        print(f'NMI of ensemble classifier:', nmi)
        print("\n-----------")

        return PerformanceResult(acc, acc_bal, nmi)

    def checkValidationSetPerformance(self, weights: list[int] = None):
        self.status = "Testing client on validation set"
        self.ensemble_validation_performance = self.__checkPerformance(self.validation_data, weights, "validation set")
        self.status = "Client model tested"

    def checkTestSetPerformance(self, weights: list[int] = None):
        self.status = "Testing client on test set"
        self.ensemble_test_performance = self.__checkPerformance(self.test_data, weights, "test set")
        self.status = "Client model tested"

    def savePerformanceToFile(self, output_dir_path: str = None, name: str = 'client_performance.txt'):
        # returns if the values have been successfully saved
        self.status = "Storing performance"
        # Lets check the client-specific performances
        if self.ensemble_validation_performance or output_dir_path or self.ensemble_test_performance is None:
            return False

        # save the values to a file
        with open(os.path.join(output_dir_path, name), 'w') as f:
            f.write(f'Validation Set:\n')
            f.write(f'Balanced accuracy of ensemble classifier: {self.ensemble_validation_performance.acc_bal}\n')
            f.write(f'Accuracy of ensemble classifier: {self.ensemble_validation_performance.acc}\n')
            f.write(f'NMI of ensemble classifier: {self.ensemble_validation_performance.nmi}\n')
            f.write(f'\nTest Set:\n')
            f.write(f'Balanced accuracy of ensemble classifier: {self.ensemble_test_performance.acc_bal}\n')
            f.write(f'Accuracy of ensemble classifier: {self.ensemble_test_performance.acc}\n')
            f.write(f'NMI of ensemble classifier: {self.ensemble_test_performance.nmi}\n')
            f.close()
        self.status = "Performance saved"
        return True


class Coordinator(Client):

    def __init__(self):
        super().__init__(init_empty=True)

    def aggregateClientModels(self, client_ensembles: list[list[gnn.GNNSubNet]]):
        self.status = f'Aggregating {len(client_ensembles)} models'
        # aggregate the models from each client
        for xx in range(len(client_ensembles)):
            ensemble = client_ensembles[xx]
            for yy in range(len(ensemble)):
                self.ensemble.ensemble.append(ensemble[yy])

        self.training_complete = True
        self.status = "Models aggregated -> Global Model ready"
