import requests
url = 'https://portainer.cristhiansancore.com.br/api/endpoints/3/docker/containers/chatwoot-evolution-evolution-api-1/exec'
headers = { 'X-API-Key': 'ptr_rZVePGsejhdi3lxxhIglzk2LCzzWuVqZyKvvZtSTvl8=' }
payload = { 'AttachStdout': True, 'AttachStderr': True, 'Cmd': ['curl', '-s', '-H', 'api_access_token: i9Ch9WjTicBEyfBtiqqNukZS', '-H', 'Content-Type: application/json', '-X', 'POST', 'http://172.28.0.10:3000/api/v1/accounts/1/contacts/filter', '-d', '{"payload":[]}'] }
res = requests.post(url, headers=headers, json=payload)
exec_id = res.json()['Id']
start_url = f'https://portainer.cristhiansancore.com.br/api/endpoints/3/docker/exec/{exec_id}/start'
res2 = requests.post(start_url, headers=headers, json={'Detach': False, 'Tty': False})
print(res2.text)
