import os

import bios

from algo import Client


def runWorkflow(external_client: Client = None, data_location: str = "data/synthetic"):
    client = external_client
    if client is None:
        client = Client()
    print("starting script")
    # read config
    config = bios.read(os.path.join(data_location, 'config.yml'))

    # get input file name from config
    input_features_name = config['input_features_name']
    input_ppi_name = config['input_ppi_name']
    input_target_name = config['input_target_name']
    # wait_for_ui = config['wait_for_ui'] - is disregarded as there is no point in running the app without the UI

    # generate file paths
    ppi = os.path.join(data_location, input_ppi_name)
    feats = os.path.join(data_location, input_features_name)
    targ = os.path.join(data_location, input_target_name)

    client.readInputDataAndSetupSubNet(data_location, ppi, [feats], targ)
    client.splitSubNetIntoTrainAndTest()
    client.train()
    client.checkValidationSetPerformance()
    client.checkTestSetPerformance()


if __name__ == '__main__':
    runWorkflow()
