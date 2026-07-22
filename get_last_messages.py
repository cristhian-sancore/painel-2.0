import requests
import json
import urllib3

urllib3.disable_warnings()

url = "https://chatwoot2.cristhiansancore.com.br/api/v1/accounts/1/conversations/15/messages"
token = "i9Ch9WjTicBEyfBtiqqNukZS"

res = requests.get(url, headers={"api_access_token": token}, verify=False)
if res.status_code == 200:
    data = res.json()
    msgs = data.get('payload', [])
    msgs = sorted(msgs, key=lambda x: x['created_at'], reverse=True)
    print(json.dumps(msgs[:3], indent=2))
else:
    print(res.text)
