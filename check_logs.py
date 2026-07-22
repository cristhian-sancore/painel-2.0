import requests
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

PORTAINER_URL = "https://PORTAINER.CRISTHIANSANCORE.COM.BR"
API_KEY = "ptr_u1U9VC6iS9m0gLl2DJ4jMWvOCqt2KYNNaQ0NNs/+OFk="

headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

def get_logs(container_name):
    endpoint_id = 3
    # Primeiro acha o ID real do container
    url = f"{PORTAINER_URL}/api/endpoints/{endpoint_id}/docker/containers/json?all=1"
    response = requests.get(url, headers=headers, verify=False)
    
    if response.status_code == 200:
        containers = response.json()
        target_id = None
        for c in containers:
            name = c.get('Names', [''])[0].strip('/')
            if name == container_name:
                target_id = c['Id']
                break
        
        if target_id:
            log_url = f"{PORTAINER_URL}/api/endpoints/{endpoint_id}/docker/containers/{target_id}/logs?stdout=1&stderr=1&tail=200"
            log_res = requests.get(log_url, headers=headers, verify=False)
            if log_res.status_code == 200:
                print(f"--- LOGS DO {container_name} ---")
                import sys
                sys.stdout.buffer.write(log_res.content)
                sys.stdout.buffer.flush()
                print("\n")
            else:
                print("Erro ao pegar logs")
        else:
            print(f"Container {container_name} não encontrado.")

if __name__ == "__main__":
    containers = [
        "chatwoot-evolution-chatwoot-1"
    ]
    for container in containers:
        get_logs(container)
