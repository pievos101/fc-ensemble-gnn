import json
import time

from bottle import Bottle, request

# This API is used to communicate with the FeatureCloud Controller

api_server = Bottle()

@api_server.post('/setup')
def ctrl_setup():
    time.sleep(1)
    print(f'[CTRL] POST /setup')
    payload = request.json
    print(payload)
    id: str = payload.get('id')
    coordinator: bool = payload.get('coordinator')
    clients: str = payload.get('clients') # list of client IDs
    return ''


@api_server.get('/status')
def ctrl_status():
    print(f'[CTRL] GET /status')
    return json.dumps({
        'available': True,
        'state': 'Web Frontend Ready',
        'finished': False,
        # 'finished': app.status_finished,
        # 'message': app.status_message if app.status_message else (app.current_state.name if app.current_state else None),
        # 'progress': app.status_progress,
        # 'state': app.status_state,
        # 'destination': app.status_destination,
        # 'smpc': app.status_smpc,
    })


@api_server.route('/data', method='GET')
def ctrl_data_out():
    print(f'[CTRL] GET /data')
    return None # nothing to share at the moment


@api_server.route('/data', method='POST')
def ctrl_data_in():
    print(f'[CTRL] POST /data')
    #app.handle_incoming(request.body.read(), request.query['client'])
    return ''