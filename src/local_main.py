from bottle import Bottle
from bottle_cors_plugin import cors_plugin

from algo import Client
from local_run import runWorkflow
from web import applyWebServerRoutes

client = Client()
global_client = Client()
server = Bottle()
server.install(cors_plugin('*'))

# add the api implementation
applyWebServerRoutes(server, client, global_client, None)

# run the training workflow to get the local model
runWorkflow(client)
global_client.ensemble = client.ensemble
global_client.training_complete = True

# start the server
server.mount('/web-api', server)
server.run(host='localhost', port=5001, debug=True)
