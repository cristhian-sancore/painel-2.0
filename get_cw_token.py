import requests
import json
import urllib3
urllib3.disable_warnings()

PORTAINER_URL = "https://PORTAINER.CRISTHIANSANCORE.COM.BR"
API_KEY = "ptr_u1U9VC6iS9m0gLl2DJ4jMWvOCqt2KYNNaQ0NNs/+OFk="
ENDPOINT_ID = 3
CONTAINER_ID = "8885397a2875f4caddee997be043a65521a9e55e1d6bb3f5d2253b9a9aafb301"

headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

# 1. Create Exec Instance
exec_payload = {
    "AttachStdin": False,
    "AttachStdout": True,
    "AttachStderr": True,
    "Tty": False,
    "Cmd": ["psql", "-U", "postgres", "-d", "chatwoot_production", "-c", "SELECT token FROM access_tokens LIMIT 5;"]
}

url_create = f"{PORTAINER_URL}/api/endpoints/{ENDPOINT_ID}/docker/containers/{CONTAINER_ID}/exec"
res = requests.post(url_create, headers=headers, json=exec_payload, verify=False)
exec_id = res.json().get("Id")

if not exec_id:
    print("Failed to create exec:", res.text)
    exit(1)

# 2. Start Exec Instance
url_start = f"{PORTAINER_URL}/api/endpoints/{ENDPOINT_ID}/docker/exec/{exec_id}/start"
start_payload = {
    "Detach": False,
    "Tty": False
}

res_start = requests.post(url_start, headers=headers, json=start_payload, verify=False)
# The response body will be the raw output of the command!
print("Raw Output:")
# Filter out docker stream multiplexing headers if present (Tty=False means it has an 8-byte header per frame)
output = res_start.content
clean_output = b""
i = 0
while i < len(output):
    if i + 8 > len(output):
        break
    # Header is 8 bytes: [stream_type, 0, 0, 0, size1, size2, size3, size4]
    stream_type = output[i]
    size = int.from_bytes(output[i+4:i+8], byteorder='big')
    clean_output += output[i+8:i+8+size]
    i += 8 + size

print(clean_output.decode('utf-8', errors='replace'))
