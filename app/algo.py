# import GNNSubNet
from GNNSubNet import GNNSubNet as gnn
# import ensemble_gnn
import ensemble_gnn as egnn
import os
import pandas as pd

from GNNSubNet.GNNSubNet import GNNSubNet


class Client:
    prediction_model: egnn.ensemble = None
    input_data = None

    def __init__(self):
        pass

    def readInputData(self, input_path):
        # read input data and store as training data
        self.input_data = pd.read_csv(input_path, header=None)

    def trainClient(self):
        # create local ensemble classier of client
        self.prediction_model = egnn.ensemble(self.input_data, niter=1)
        # train local ensemble classier of client 1
        self.prediction_model.train()
        # self.prediction_model.grow(10) # greedy step
        return self.prediction_model

    def checkClientPerformance(self, global_test_data):
        # Lets check the client-specific performances
        from sklearn.metrics import balanced_accuracy_score
        from sklearn.metrics import accuracy_score
        from sklearn.metrics.cluster import normalized_mutual_info_score

        ## client 1
        p_predicted_class = self.prediction_model.predict(global_test_data)
        acc = accuracy_score(global_test_data.true_class, p_predicted_class)
        acc_bal = balanced_accuracy_score(global_test_data.true_class, p_predicted_class)
        nmi = normalized_mutual_info_score(global_test_data.true_class, p_predicted_class)

        print("\n-----------")
        print(f'Balanced accuracy of ensemble classifier:', acc_bal)
        print(f'Accuracy of ensemble classifier:', acc)
        print("\n-----------")
        print(f'NMI of ensemble classifier:', nmi)

    def storeGlobalModelOnClient(self, output_path):
        f = open(output_path, "global_model")
        # TODO: save the global model
        f.write(str(self.prediction_model))
        f.close()


class Coordinator(Client):
    global_model: egnn.ensemble = None
    g: GNNSubNet = None
    global_test_data = None
    number_clients: int = 1
    client_training_data: tuple = None

    def setup(self):
        # location of the files
        working_dir = os.getcwd()
        loc = f'{working_dir}/GNN-SubNet/TCGA'
        # PPI network
        ppi = f'{loc}/KIDNEY_RANDOM_PPI.txt'
        # single-omic features
        feats = [f'{loc}/KIDNEY_RANDOM_mRNA_FEATURES.txt']
        # multi-omic features
        # feats = [f'{loc}/KIDNEY_RANDOM_mRNA_FEATURES.txt', f'{loc}/KIDNEY_RANDOM_Methy_FEATURES.txt']
        # outcome class
        targ = f'{loc}/KIDNEY_RANDOM_TARGET.txt'

        # Load the multi-omics data
        self.g = gnn.GNNSubNet(loc, ppi, feats, targ)

    def splitUpData(self):
        # train-test split: 80-20
        g_train, self.global_test_data = egnn.split(self.g, 0.8)
        # client number specific equal split of the training data
        self.client_training_data = egnn.split(g_train, 100 / self.number_clients)

    def aggregateModels(self, clients):
        # aggregate the models from each client
        # without sharing any data
        self.global_model = egnn.aggregate(clients)

    def checkGlobalPerformance(self, global_test_data):
        # Make predictions using the global model via Majority Vote
        predicted_class = self.global_model.predict(global_test_data)

        # Lets check the performance of the federated ensemble classifier
        from sklearn.metrics import balanced_accuracy_score
        from sklearn.metrics import accuracy_score

        acc = accuracy_score(global_test_data.true_class, predicted_class)
        acc_bal = balanced_accuracy_score(global_test_data.true_class, predicted_class)
        print("\n-----------")
        print("Balanced accuracy of global ensemble classifier:", acc_bal)
        print("Accuracy of global ensemble classifier:", acc)

        from sklearn.metrics.cluster import normalized_mutual_info_score
        nmi = normalized_mutual_info_score(global_test_data.true_class, predicted_class)

        print("\n-----------")
        print("NMI of global ensemble classifier:", nmi)
