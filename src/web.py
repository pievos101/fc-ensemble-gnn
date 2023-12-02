from __future__ import annotations

import json
from json import JSONEncoder

from FeatureCloud.app.engine.app import app, App
from bottle import Bottle, abort, request
from bottle_cors_plugin import cors_plugin

from algo import getGraphs, Client
from states import local_model, global_model, callback_fn_terminal_state, start_weight_distribution, States


def applyWebServerRoutes(server: Bottle, local_client: Client, global_client: Client, fc_app: App | None = None):
    @server.get('/status')
    def getStatus():
        # return the current status of the process
        status = {
            'status': local_client.status,
            'local_training_complete': local_client.training_complete,
            'global_training_complete': global_client.training_complete,
            'role': "client",
            'weight_aggregation_ongoing': False,
            'global_weights_available': len(global_client.aggregated_weight_configuration) > 0,
        }
        if fc_app is not None and fc_app.current_state is not None:
            status['state'] = fc_app.current_state.name
            if local_client.is_coordinator:
                status['role'] = "coordinator"
            # check if the weight aggregation is ongoing
            if status['state'] == States.DISTRIBUTE_WEIGHTS or status['state'] == States.WAITING_FOR_GLOBAL_WEIGHTS:
                status['weight_aggregation_ongoing'] = True
            return status
        else:
            status['state'] = 'No FeatureCloud App'
            return status

    @server.post('/compute-performance')
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

        if weights is not None:
            client.storeWeights(weights)

        if is_test_set:
            client.checkTestSetPerformance()
            performance = client.ensemble_test_performance
        else:
            client.checkValidationSetPerformance()
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

    @server.get('/global-weights')
    def getGlobalWeights():
        """
        Returns the global weights if available, otherwise returns an 404 error
        :return: JSON (list[int])
        """
        if not global_client.aggregated_weight_configuration:
            abort(404, "Global weights not available yet")
            return {'available': False}

        return JSONEncoder().encode(global_client.aggregated_weight_configuration)

    @server.post('/distribute-weights')
    def distributeWeights():
        # reset the global weights before each distribution
        global_client.aggregated_weight_configuration = []

        # if no weights are available, use neutral weights (1) for each classifier
        if len(global_client.weight_configuration) == 0:
            global_client.weight_configuration = [1] * len(global_client.ensemble.ensemble)
        start_weight_distribution()

    @api_server.post('/terminate')
    def terminateRun():
        callback_fn_terminal_state()


api_server = Bottle()


api_server.install(cors_plugin('*'))
applyWebServerRoutes(server=api_server, local_client=local_model, global_client=global_model, fc_app=app)
