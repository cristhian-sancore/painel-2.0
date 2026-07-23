import sys
import requests
import urllib3

urllib3.disable_warnings()

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

TOKEN = 'i9Ch9WjTicBEyfBtiqqNukZS'
BASE_URL = 'https://chatwoot2.cristhiansancore.com.br/api/v1/accounts/1'
HEADERS = {'api_access_token': TOKEN}

def delete_all_conversations():
    print("Buscando conversas para apagar...")
    conv_count = 0
    while True:
        r = requests.get(f'{BASE_URL}/conversations?status=all&assignee_type=all', headers=HEADERS, verify=False).json()
        payload = r.get('data', {}).get('payload', [])
        if not payload:
            break
        for c in payload:
            cid = c.get('id')
            # Chatwoot doesn't have a direct conversation delete API endpoint in v1 public spec always, but toggle status or delete contact works.
            conv_count += 1
    print(f"Total de conversas encontradas: {conv_count}")

def delete_all_contacts():
    print("Iniciando limpeza TOTAL de contatos do Chatwoot...")
    deleted_total = 0
    while True:
        r = requests.get(f'{BASE_URL}/contacts?page=1', headers=HEADERS, verify=False).json()
        payload = r.get('payload', [])
        if not payload:
            break
        print(f"Apagando lote de {len(payload)} contatos...")
        for c in payload:
            cid = c.get('id')
            name = (c.get('name', '') or '').encode('ascii', 'ignore').decode()
            r_del = requests.delete(f'{BASE_URL}/contacts/{cid}', headers=HEADERS, verify=False)
            if r_del.status_code == 200:
                deleted_total += 1
                print(f"Deletado [{deleted_total}]: ID {cid} ({name})")
            else:
                print(f"Erro ao deletar ID {cid}: {r_del.status_code}")

    print(f"\n Limpeza Concluída! Total de {deleted_total} contatos removidos do Chatwoot.")

if __name__ == '__main__':
    delete_all_conversations()
    delete_all_contacts()
