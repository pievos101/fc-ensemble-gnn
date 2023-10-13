from bottle import Bottle
from FeatureCloud.app.api.http_ctrl import api_server
from FeatureCloud.app.engine.app import app
from web import api_server as web_api_server

# import is needed to register the states
import states

server = Bottle()

if __name__ == '__main__':
    app.register()
    server.mount('/api', api_server)
    server.mount('/web-api', web_api_server)
    server.run(host='localhost', port=5001)
