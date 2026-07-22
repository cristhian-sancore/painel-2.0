import requests
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

PORTAINER_URL = "https://PORTAINER.CRISTHIANSANCORE.COM.BR"
API_KEY = "ptr_u1U9VC6iS9m0gLl2DJ4jMWvOCqt2KYNNaQ0NNs/+OFk="

headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

COMPOSE_FILE = """
version: '3'
services:
  postgres-cw:
    image: pgvector/pgvector:pg15
    restart: always
    environment:
      - POSTGRES_PASSWORD=chatwoot_strong_password
      - POSTGRES_USER=postgres
      - POSTGRES_DB=chatwoot_production
    volumes:
      - chatwoot-db-data:/var/lib/postgresql/data

  redis-cw:
    image: redis:7-alpine
    restart: always
    volumes:
      - chatwoot-redis-data:/data

  chatwoot:
    image: chatwoot/chatwoot:latest
    environment:
      - SECRET_KEY_BASE=c2hhdHdvb3Rfc2VjcmV0X2tleV9iYXNlXzEyMzQ1Njc4OTA=
      - FRONTEND_URL=http://localhost:3000
      - DEFAULT_LOCALE=pt_BR
      - FORCE_SSL=false
      - ENABLE_ACCOUNT_SIGNUP=true
      - REDIS_URL=redis://redis-cw:6379
      - POSTGRES_DATABASE=chatwoot_production
      - POSTGRES_HOST=postgres-cw
      - POSTGRES_USERNAME=postgres
      - POSTGRES_PASSWORD=chatwoot_strong_password
      - INSTALLATION_ENV=docker
    ports:
      - "3000:3000"
    depends_on:
      - postgres-cw
      - redis-cw
    command: ['bundle', 'exec', 'rails', 's', '-p', '3000', '-b', '0.0.0.0']

  sidekiq:
    image: chatwoot/chatwoot:latest
    environment:
      - SECRET_KEY_BASE=c2hhdHdvb3Rfc2VjcmV0X2tleV9iYXNlXzEyMzQ1Njc4OTA=
      - DEFAULT_LOCALE=pt_BR
      - REDIS_URL=redis://redis-cw:6379
      - POSTGRES_DATABASE=chatwoot_production
      - POSTGRES_HOST=postgres-cw
      - POSTGRES_USERNAME=postgres
      - POSTGRES_PASSWORD=chatwoot_strong_password
      - INSTALLATION_ENV=docker
    depends_on:
      - postgres-cw
      - redis-cw
    command: ['bundle', 'exec', 'sidekiq', '-C', 'config/sidekiq.yml']

  chatwoot-init:
    image: chatwoot/chatwoot:latest
    environment:
      - SECRET_KEY_BASE=c2hhdHdvb3Rfc2VjcmV0X2tleV9iYXNlXzEyMzQ1Njc4OTA=
      - DEFAULT_LOCALE=pt_BR
      - REDIS_URL=redis://redis-cw:6379
      - POSTGRES_DATABASE=chatwoot_production
      - POSTGRES_HOST=postgres-cw
      - POSTGRES_USERNAME=postgres
      - POSTGRES_PASSWORD=chatwoot_strong_password
      - INSTALLATION_ENV=docker
    depends_on:
      - postgres-cw
      - redis-cw
    command: ['bundle', 'exec', 'rake', 'db:chatwoot_prepare']

  evolution-api:
    image: evoapicloud/evolution-api:latest
    ports:
      - "8081:8080"
    environment:
      - SERVER_URL=http://localhost:8081
      - AUTHENTICATION_API_KEY=sancore_evolution_master_key_123
      - CORS_ORIGIN=*
      - CORS_METHODS=GET,POST,PUT,DELETE
      - CORS_CREDENTIALS=true
      - DATABASE_PROVIDER=postgresql
      - DATABASE_CONNECTION_URI=postgresql://postgres:chatwoot_strong_password@postgres-cw:5432/evolution_db?schema=public
      - CACHE_REDIS_URI=redis://redis-cw:6379/1
      - CACHE_REDIS_PREFIX_KEY=evolution
    depends_on:
      - postgres-cw
      - redis-cw
    restart: always

volumes:
  chatwoot-db-data:
  chatwoot-redis-data:
"""

def deploy_stack():
    endpoint_id = 3
    payload = {
        "Name": "chatwoot-evolution",
        "StackFileContent": COMPOSE_FILE,
        "Env": []
    }
    
    url = f"{PORTAINER_URL}/api/stacks/create/standalone/string?endpointId={endpoint_id}"
    
    response = requests.post(url, headers=headers, json=payload, verify=False)
    
    if response.status_code == 200:
        print("Stack Chatwoot + Evolution implantada com sucesso no Portainer!")
    else:
        print(f"Erro ao implantar stack: {response.status_code} - {response.text}")

if __name__ == "__main__":
    deploy_stack()
