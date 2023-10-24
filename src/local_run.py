from algo import Client, getGraphs


def runWorkflow(external_client: Client = None):
    client = external_client
    if client is None:
        client = Client()
    print("starting script")
    # location of the files
    loc = "data/synthetic"
    # PPI network
    ppi = f'{loc}/NETWORK_synthetic.txt'
    # single-omic features
    feats = [f'{loc}/FEATURES_synthetic.txt']
    # multi-omic features
    # feats = [f'{loc}/KIDNEY_RANDOM_mRNA_FEATURES.txt', f'{loc}/KIDNEY_RANDOM_Methy_FEATURES.txt']
    # outcome class
    targ = f'{loc}/TARGET_synthetic.txt'
    client.readInputDataAndSetupSubNet(loc, ppi, feats, targ)
    client.splitSubNetIntoTrainAndTest()
    client.train()
    client.checkValidationSetPerformance()
    client.checkTestSetPerformance()
    print("printing graph")
    print(getGraphs(client.ensemble)[0])


if __name__ == '__main__':
    runWorkflow()
