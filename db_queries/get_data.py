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

def log_in(session):
    query_params = {
        'response_type': 'token',
        'client_id': 'cjs-api-swagger',
        'redirect_uri': 'https://cjs-services.infare.net/current/swagger/oauth2-redirect.html',
        'scope': 'infare-services-cjv',
        'state': 'VGh1IE1hciAzMSAyMDIyIDE2OjA5OjIyIEdNVCswMzAwIChFYXN0ZXJuIEV1cm9wZWFuIFN1bW1lciBUaW1lKQ=='
    }
    request = requests.Request('GET', 'https://identity.infare.net/connect/authorize', params=query_params)
    
    prepp_request = request.prepare()
    response = session.send(prepp_request)

session = requests.Session()
log_in(session)
get_data(session)
