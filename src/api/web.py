from json import JSONEncoder

from bottle import Bottle, abort, request
from FeatureCloud.app.engine.app import app
from src.states import callback_fn_terminal_state, app, client
from src.algo import getGraphs

api_server = Bottle()

## get the status of the current training process (is this possible with interupts or do we need polling)
@api_server.route('/status', method='GET')
def getStatus():
    # return the current status of the process
    return {'status': client.status, 'state': app.current_state.name}

@api_server.get('/global-model')
def getGlobalModel():
    """
    Returns the global model if it is available, otherwise returns an 404 error
    :return: JSON
    """
    if not client.global_model:
        abort(404, "Global model not available yet")
        return {'available': False}

    data = getGraphs(client.global_model)
    return JSONEncoder().encode(data)

@api_server.get('/local-model')
def getLocalModel():
    """
    Returns the global model if it is available, otherwise returns an 404 error
    :return: JSON
    """
    if not client.local_model:
        abort(404, "Local model not available yet")
        return {'available': False}

    data = getGraphs(client.local_model)
    return JSONEncoder().encode(data)

# TODO: create the following API endpoints:
# model management
## upload patient data (receive several files)
# @api_server.route('/data', method='PUT')
# def uploadPatientData():
#     # get the data from the request
#     mrna_file = request.files.get('mrna')
#     ppi_file = request.files.get('ppi')
#     target_file = request.files.get('target')
#     client.readInputDataAndSetupSubNet(ppi_file, mrna_file, target_file)
#     # TODO: load the data into the model
#     # TODO: What to do if the files are already there?

## train local model
# @api_server.route('/train', method='POST')
# def trainLocalModel():
#     # Note this starts the training process and returns immediately. The training process is running in the background
#     if not client.g:
#         abort(400, "No data available")
#     client.trainClient()

# configuration management

## get all configurations from the community
@api_server.route('/configurations', method='GET')
def getConfigurations():
    # send all configurations from the global context

## create new configuration
@api_server.route('/configurations', method='POST')
def createConfiguration():
    # create a new configuration and send it to the global context

@api_server.route('/terminate', methods=['POST'])
def terminateRun():
    callback_fn_terminal_state()
    return


