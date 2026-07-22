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

COMPOSE_FILE = """
version: '3.3'
services:
  mariadb:
    image: mariadb:10.11
    container_name: glpi-mariadb
    environment:
      - MARIADB_ROOT_PASSWORD=sancore_root_db_pass
      - MARIADB_DATABASE=glpidb
      - MARIADB_USER=glpi_user
      - MARIADB_PASSWORD=glpi_pass
    volumes:
      - glpi-db:/var/lib/mysql
    restart: always

  glpi:
    image: diouxx/glpi:latest
    container_name: glpi
    ports:
      - "8080:80"
    volumes:
      - glpi-html:/var/www/html/glpi
    environment:
      - TIMEZONE=America/Sao_Paulo
    depends_on:
      - mariadb
    restart: always

volumes:
  glpi-db:
  glpi-html:
"""

def deploy_stack():
    endpoint_id = 3
    
    payload = {
        "Name": "glpi",
        "StackFileContent": COMPOSE_FILE,
        "Env": []
    }
    
    url = f"{PORTAINER_URL}/api/stacks/create/standalone/string?endpointId={endpoint_id}"
    
    response = requests.post(url, headers=headers, json=payload, verify=False)
    
    if response.status_code == 200:
        print("Stack GLPI implantada com sucesso no Portainer!")
        print(response.json())
    else:
        print(f"Erro ao implantar stack: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    deploy_stack()
