import requests

def get_data(session):
    query_params = {
        'date': '2022-03-30',
        'subline-id=375723': '375723'
    }
    request = requests.Request('GET', 'https://cjs-services.infare.net/current/cjv1.0/stats/transactions/', params=query_params).prepare()

    response = session.send(request)

    print(response.text)

def to_base64(input: str):
    input_bytes = input.encode('ascii')
    base64_bytes = base64.b64encode(input_bytes)

    return base64_bytes.decode('ascii')

def log_in(session):
    post_params = [
        'grant_type=password',
        'scope=openid profile role infare-services-voom infare-services-cjv',
        'client_id=cjv-span-dev',
        'client_secret=MJfmazWCXmtIBpDXNUSbxKJnaRhEDGcgdGOTKJJynBhjJVdnDo',
        'username=CJV_IntegrationTestAdminUserDev',
        'password=v3iYFzZoTtpoaHYVNjLO'
    ]
    headers = {
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': '*/*',
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded",
    }
    request = requests.Request('POST', 'https://identity.infare.net/connect/token', data='&'.join(post_params).encode('UTF-8'), headers=headers).prepare()
    
    response = session.send(request)
    source_log_in = response.text

    pass

session = requests.Session()
session.proxies = {
    'http': 'http://127.0.0.1:8888',
    'https': 'http://127.0.0.1:8888'
}
log_in(session)
get_data(session)
