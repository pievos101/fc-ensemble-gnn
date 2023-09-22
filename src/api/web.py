from bottle import Bottle

api_server = Bottle()

@api_server.route('/global-model', methods=['GET'])
def status():
    """
    GET request to /status, if True is returned a GET data request will be send
    :return: JSON with key 'available' and value True (/data GET request) or False (/data POST request)

    """
    return {'patientIsSick': True}

# TODO: create the following API endpoints:
# model management
## upload patient data
## train local model
## reset local state
## send local model to coordinator
## get the global model
## get the status of the current training process (is this possible with interupts or do we need polling)

# configuration management
## get all configurations from the community
## create new configuration
## modify configuration
## delete configuration
## apply configuration
# TODO: evaluate if configuration changes can be applied in real time or with longer loading time




