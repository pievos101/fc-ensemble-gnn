import json
from json import JSONEncoder

from FeatureCloud.app.engine.app import app
from bottle import Bottle, abort, request

from algo import getGraphs, Client
from states import local_model, global_model, callback_fn_terminal_state


def applyWebServerRoutes(server: Bottle, local_client: Client, global_client: Client, fc_app: app):
    @server.get('/status')
    def getStatus():
        # return the current status of the process
        status = {
            'status': local_client.status,
            'local_training_complete': local_client.training_complete,
            'global_training_complete': global_client.training_complete,
        }
        if fc_app is not None:
            status['state'] = fc_app.current_state.name
            return status
        else:
            status['state'] = 'No FeatureCloud App'
            return status

    @server.post('/compute-performance', method='POST')
    def getStatus():
        # get the model weights and validation or test set flag from the request
        # weights:
        #   disable = 0
        #   decrease = 0.5
        #   neutral = 1
        #   increase = 1.5
        body = json.load(request.body)

        weights: list = body.get('weights')
        is_test_set = body.get('is_test_set')
        client_to_use = body.get('client')

        if client_to_use == 'local':
            client = local_client
        else:
            client = global_client

        if is_test_set:
            client.checkTestSetPerformance(weights)
            performance = client.ensemble_test_performance
        else:
            client.checkValidationSetPerformance(weights)
            performance = client.ensemble_validation_performance

        return {
            'acc': round(performance.acc, 4),
            'acc_bal': round(performance.acc_bal, 4),
            'nmi': round(performance.nmi, 4),
        }

    @server.get('/global-model')
    def getGlobalModel():
        """
        Returns the global model if it is available, otherwise returns an 404 error
        :return: JSON
        """
        if not global_client.ensemble:
            abort(404, "Global model not available yet")
            return {'available': False}

        data = getGraphs(global_client.ensemble)

        return JSONEncoder().encode(data)

    @server.get('/local-model')
    def getLocalModel():
        """
        Returns the local model if it is available, otherwise returns an 404 error
        :return: JSON
        """
        if not local_client.ensemble:
            abort(404, "Local model not available yet")
            return {'available': False}

        data = getGraphs(local_client.ensemble)
        return JSONEncoder().encode(data)


api_server = Bottle()


@api_server.route('/terminate', methods=['POST'])
def terminateRun():
    callback_fn_terminal_state()


applyWebServerRoutes(api_server, local_model, global_model, app)
