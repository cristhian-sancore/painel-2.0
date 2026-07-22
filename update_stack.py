import requests
import json

url = 'https://portainer.cristhiansancore.com.br/api/stacks/14/file'
headers = { 'X-API-Key': 'ptr_rZVePGsejhdi3lxxhIglzk2LCzzWuVqZyKvvZtSTvl8=' }
res = requests.get(url, headers=headers)
compose = res.json().get('StackFileContent')

new_compose = compose.replace('FRONTEND_URL=http://localhost:3000', 'FRONTEND_URL=https://chatwoot2.cristhiansancore.com.br\n      - ENABLE_IFRAME_EMBED=true')

print(new_compose)

update_url = 'https://portainer.cristhiansancore.com.br/api/stacks/14?endpointId=3'
payload = {
    'StackFileContent': new_compose,
    'Env': [],
    'Prune': True
}

res2 = requests.put(update_url, headers=headers, json=payload)
print(res2.status_code, res2.text)
