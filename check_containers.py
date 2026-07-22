import requests
import json
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

PORTAINER_URL = "https://PORTAINER.CRISTHIANSANCORE.COM.BR"
API_KEY = "ptr_u1U9VC6iS9m0gLl2DJ4jMWvOCqt2KYNNaQ0NNs/+OFk="

headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

def check_containers():
    endpoint_id = 3
    url = f"{PORTAINER_URL}/api/endpoints/{endpoint_id}/docker/containers/json?all=1"
    
    response = requests.get(url, headers=headers, verify=False)
    
    if response.status_code == 200:
        containers = response.json()
        print("Status dos Containers:")
        print("-" * 50)
        for c in containers:
            name = c.get('Names', [''])[0].strip('/')
            state = c.get('State', 'N/A')
            status = c.get('Status', 'N/A')
            
            # Filtrar apenas os que nos interessam (Chatwoot, Evolution, GLPI, etc)
            if any(x in name.lower() for x in ['chatwoot', 'evolution', 'glpi', 'redis', 'postgres', 'sidekiq']):
                print(f"Nome: {name:<25} | Estado: {state:<10} | Detalhe: {status}")
    else:
        print(f"Erro ao buscar containers: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    check_containers()
