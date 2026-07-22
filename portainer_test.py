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

def get_endpoints():
    response = requests.get(f"{PORTAINER_URL}/api/endpoints", headers=headers, verify=False)
    if response.status_code == 200:
        endpoints = response.json()
        print(f"Encontrados {len(endpoints)} endpoints:")
        for ep in endpoints:
            print(f"- ID: {ep['Id']}, Nome: {ep['Name']}, Status: {ep.get('Status', 'N/A')}")
        return endpoints
    else:
        print(f"Erro ao buscar endpoints: {response.status_code} - {response.text}")
        return []

if __name__ == "__main__":
    get_endpoints()
