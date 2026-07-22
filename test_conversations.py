import requests
import json

url = "https://chatwoot2.cristhiansancore.com.br/api/v1/accounts/1/conversations"
token = "i9Ch9WjTicBEyfBtiqqNukZS"

res = requests.get(url, headers={"api_access_token": token})
print(res.status_code)
if res.status_code == 200:
    data = res.json()
    print(json.dumps(data, indent=2))
else:
    print(res.text)
