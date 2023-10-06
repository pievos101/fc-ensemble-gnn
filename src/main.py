from bottle import Bottle
from FeatureCloud.app.api.http_ctrl import api_server
from FeatureCloud.app.engine.app import app
from api import web

# import is needed to register the states
import states

server = Bottle()

if __name__ == '__main__':
    app.register()
    server.mount('/api', api_server)
    server.mount('/web-api', web.api_server)
    server.run(host='localhost', port=5001)
