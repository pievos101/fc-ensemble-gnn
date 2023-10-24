from bottle import Bottle
from bottle_cors_plugin import cors_plugin

from algo import Client
from local_run import runWorkflow
from web import applyWebServerRoutes

client = Client()
server = Bottle()
server.install(cors_plugin('*'))

# add the api implementation
applyWebServerRoutes(server, client, Client(), None)

# run the training workflow to get the local model
runWorkflow(client)

# start the server
server.mount('/web-api', server)
server.run(host='localhost', port=5001, debug=True, reloader=True)
