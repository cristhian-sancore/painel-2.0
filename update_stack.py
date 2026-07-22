import requests
import urllib3
import json

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

PORTAINER_URL = "https://PORTAINER.CRISTHIANSANCORE.COM.BR"
API_KEY = "ptr_u1U9VC6iS9m0gLl2DJ4jMWvOCqt2KYNNaQ0NNs/+OFk="

headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

# The fixed compose file
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

def update_stack():
    endpoint_id = 3
    
    # 1. Get stacks
    print("Buscando stacks...")
    resp = requests.get(f"{PORTAINER_URL}/api/stacks", headers=headers, verify=False)
    if resp.status_code != 200:
        print(f"Erro ao listar stacks: {resp.status_code}")
        return
        
    stacks = resp.json()
    target_stack = next((s for s in stacks if s['Name'] == 'chatwoot-evolution'), None)
    
    if not target_stack:
        print("Stack chatwoot-evolution não encontrada!")
        return
        
    stack_id = target_stack['Id']
    
    # 2. Update stack
    print(f"Atualizando stack {stack_id}...")
    
    # Needs Prune=False, PullImage=False, StackFileContent
    payload = {
        "StackFileContent": COMPOSE_FILE,
        "Env": target_stack.get('Env', []),
        "Prune": False,
        "PullImage": True
    }
    
    update_url = f"{PORTAINER_URL}/api/stacks/{stack_id}?endpointId={endpoint_id}"
    update_resp = requests.put(update_url, headers=headers, json=payload, verify=False)
    
    if update_resp.status_code == 200:
        print("Stack atualizada com sucesso! Recriando containers...")
    else:
        print(f"Erro ao atualizar stack: {update_resp.status_code} - {update_resp.text}")

if __name__ == "__main__":
    update_stack()
