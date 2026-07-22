import requests
import json
with open('acesso-AIP.txt', 'r') as f:
    for line in f:
        if line.startswith('ptr_'):
            key = line.strip()

url = 'http://portainer.cristhiansancore.com.br:9000/api/stacks/21'
headers = {'X-API-Key': key}
r = requests.get(url, headers=headers)
print(json.dumps(r.json().get('Env', []), indent=2))
