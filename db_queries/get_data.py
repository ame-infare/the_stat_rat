import base64
from datetime import datetime, timezone, timedelta
from weakref import proxy

import requests

def get_data(session):
    query_params = {
        'date': '2022-03-30',
        'subline-id=375723': '375723'
    }
    request = requests.Request('GET', 'https://cjs-services.infare.net/current/cjv1.0/stats/transactions/', params=query_params)

    prepp_request = request.prepare()
    response = session.send(prepp_request)

    print(response.text)

def to_base64(input: str):
    input_bytes = input.encode('ascii')
    base64_bytes = base64.b64encode(input_bytes)

    return base64_bytes.decode('ascii')

def log_in(session):
    datetime_string = datetime.now(timezone(timedelta(hours=3))).strftime('%a %b %d %Y %H:%M:%S %Z')
    datetime_base64 = to_base64(datetime_string)

    query_params = {
        'response_type': 'token',
        'client_id': 'cjs-api-swagger',
        'redirect_uri': 'https://cjs-services.infare.net/current/swagger/oauth2-redirect.html',
        'scope': 'infare-services-cjv',
        'state': {datetime_base64}
    }
    request = requests.Request('GET', 'https://identity.infare.net/connect/authorize', params=query_params)
    
    prepp_request = request.prepare()
    response = session.send(prepp_request)
    pass

session = requests.Session()
session.proxies = {'https': '127.0.0.1'}
log_in(session)
get_data(session)
