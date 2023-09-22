from bottle import Bottle

from FeatureCloud.app.api.http_ctrl import api_server

from FeatureCloud.app.engine.app import app
from api import web
import states

web_server = Bottle()
server = Bottle()

# torchvision
# torch-geometric
# torch-scatter
# torch-sparse
# scikit-learn


if __name__ == '__main__':
    app.register()
    server.mount('/api', api_server)
    server.mount('/web', web.api_server)
    server.run(host='localhost', port=5000)
