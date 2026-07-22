import requests
import urllib3
urllib3.disable_warnings()

PORTAINER_URL = "https://PORTAINER.CRISTHIANSANCORE.COM.BR"
API_KEY = "ptr_u1U9VC6iS9m0gLl2DJ4jMWvOCqt2KYNNaQ0NNs/+OFk="
ENDPOINT_ID = 3
REDIS_ID = "6311971b30b8598739a62bddbecf09be2f789db4182256c89825a7c9cec0eb75"

headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

print("Flushing Redis...")
exec_payload = {
    "AttachStdin": False,
    "AttachStdout": True,
    "AttachStderr": True,
    "Tty": False,
    "Cmd": ["redis-cli", "FLUSHALL"]
}
url_create = f"{PORTAINER_URL}/api/endpoints/{ENDPOINT_ID}/docker/containers/{REDIS_ID}/exec"
res = requests.post(url_create, headers=headers, json=exec_payload, verify=False)
exec_id = res.json().get("Id")
url_start = f"{PORTAINER_URL}/api/endpoints/{ENDPOINT_ID}/docker/exec/{exec_id}/start"
requests.post(url_start, headers=headers, json={"Detach": False, "Tty": False}, verify=False)

print("Redis flushed. Restarting Evolution API...")

# Get Evolution API ID
res = requests.get(f"{PORTAINER_URL}/api/endpoints/{ENDPOINT_ID}/docker/containers/json?all=1", headers=headers, verify=False)
evo = next(x for x in res.json() if '/chatwoot-evolution-evolution-api-1' in x['Names'])
evo_id = evo['Id']

res_restart = requests.post(f"{PORTAINER_URL}/api/endpoints/{ENDPOINT_ID}/docker/containers/{evo_id}/restart", headers=headers, verify=False)
if res_restart.status_code == 204:
    print("Evolution API restarted successfully.")
else:
    print("Failed to restart Evolution:", res_restart.text)
