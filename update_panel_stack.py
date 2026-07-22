import requests
import urllib3
import time
import os
urllib3.disable_warnings()

PORTAINER_URL = "https://PORTAINER.CRISTHIANSANCORE.COM.BR"
API_KEY = "ptr_u1U9VC6iS9m0gLl2DJ4jMWvOCqt2KYNNaQ0NNs/+OFk="
STACK_ID = 15
ENDPOINT_ID = 3

headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

with open("docker-compose.panel.yml", "r") as f:
    local_compose = f.read()

res = requests.get(f"{PORTAINER_URL}/api/stacks/{STACK_ID}?endpointId={ENDPOINT_ID}", headers=headers, verify=False)
stack = res.json()

payload = {
    "env": [],
    "prune": True,
    "pullImage": True,
    "stackFileContent": local_compose
}

url = f"{PORTAINER_URL}/api/stacks/{STACK_ID}?endpointId={ENDPOINT_ID}"
res3 = requests.put(url, headers=headers, json=payload, verify=False)
if res3.status_code == 200:
    print("Panel Stack updated successfully with LOCAL compose file! Latest image pulled.")
else:
    print(f"Error updating stack: {res3.status_code} - {res3.text}")
