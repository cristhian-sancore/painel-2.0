import requests
import urllib3
urllib3.disable_warnings()

EVOLUTION_API_URL = "https://evolution.cristhiansancore.com.br"
API_KEY = "sancore_evolution_master_key_123"

headers = {
    "apikey": API_KEY,
    "Content-Type": "application/json"
}

try:
    res = requests.get(f"{EVOLUTION_API_URL}/instance/fetchInstances", headers=headers, verify=False)
    print("Instances:", res.json())

    res2 = requests.get(f"{EVOLUTION_API_URL}/instance/connectionState/teste", headers=headers, verify=False)
    print("State 'teste':", res2.text)

    res3 = requests.get(f"{EVOLUTION_API_URL}/instance/connect/teste", headers=headers, verify=False)
    print("Connect 'teste':", res3.status_code)
except Exception as e:
    print("Error:", e)
