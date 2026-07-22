import requests
import urllib3
import time

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

PORTAINER_URL = "https://PORTAINER.CRISTHIANSANCORE.COM.BR"
API_KEY = "ptr_u1U9VC6iS9m0gLl2DJ4jMWvOCqt2KYNNaQ0NNs/+OFk="

headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

def reset():
    endpoint_id = 3
    
    # 1. Get stacks
    resp = requests.get(f"{PORTAINER_URL}/api/stacks", headers=headers, verify=False)
    stacks = resp.json()
    target_stack = next((s for s in stacks if s['Name'] == 'chatwoot-evolution'), None)
    
    if target_stack:
        stack_id = target_stack['Id']
        print(f"Deletando stack {stack_id}...")
        requests.delete(f"{PORTAINER_URL}/api/stacks/{stack_id}?endpointId={endpoint_id}", headers=headers, verify=False)
        time.sleep(5)
    
    # 2. Get and Delete Volumes
    print("Deletando volumes do Chatwoot...")
    vol_resp = requests.get(f"{PORTAINER_URL}/api/endpoints/{endpoint_id}/docker/volumes", headers=headers, verify=False)
    if vol_resp.status_code == 200:
        volumes = vol_resp.json().get("Volumes", [])
        for v in volumes:
            if "chatwoot-db-data" in v["Name"] or "chatwoot-redis-data" in v["Name"]:
                print(f"Apagando {v['Name']}...")
                requests.delete(f"{PORTAINER_URL}/api/endpoints/{endpoint_id}/docker/volumes/{v['Name']}", headers=headers, verify=False)
    
    print("Pronto! Agora pode rodar o deploy_chatwoot.py novamente.")

if __name__ == "__main__":
    reset()
