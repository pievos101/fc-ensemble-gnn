from json import JSONEncoder

from bottle import Bottle, abort, request
from FeatureCloud.app.engine.app import app
from states import callback_fn_terminal_state, client
from algo import getGraphs

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

## get all configurations from the community
# @api_server.route('/configurations', method='GET')
# def getConfigurations():
#     # send all configurations from the global context
#
# ## create new configuration
# @api_server.route('/configurations', method='POST')
# def createConfiguration():
#     # create a new configuration and send it to the global context
#
# @api_server.route('/terminate', methods=['POST'])
# def terminateRun():
#     callback_fn_terminal_state()
#     return
