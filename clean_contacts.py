import sys
import requests
import urllib3

urllib3.disable_warnings()

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

TOKEN = 'i9Ch9WjTicBEyfBtiqqNukZS'
BASE_URL = 'https://chatwoot2.cristhiansancore.com.br/api/v1/accounts/1'
HEADERS = {'api_access_token': TOKEN}

def get_all_contacts():
    contacts = []
    page = 1
    while True:
        r = requests.get(f'{BASE_URL}/contacts?page={page}', headers=HEADERS, verify=False).json()
        payload = r.get('payload', [])
        if not payload:
            break
        contacts.extend(payload)
        page += 1
    return contacts

def delete_contact(contact_id):
    r = requests.delete(f'{BASE_URL}/contacts/{contact_id}', headers=HEADERS, verify=False)
    return r.status_code == 200

if __name__ == '__main__':
    contacts = get_all_contacts()
    print(f"Total de contatos encontrados no Chatwoot: {len(contacts)}")
    
    deleted_count = 0
    for c in contacts:
        cid = c.get('id')
        name = c.get('name', '') or ''
        phone = c.get('phone_number', '') or ''
        identifier = c.get('identifier', '') or ''
        
        # Filtro de contatos problemáticos / zumbis (grupos, 0@s.whatsapp.net, etc.)
        if '0@s.whatsapp.net' in identifier or '@g.us' in identifier or name == '3' or '33840198' in identifier:
            print(f"Deletando contato zumbi: ID {cid} - {name.encode('ascii', 'ignore').decode()} ({identifier})")
            if delete_contact(cid):
                deleted_count += 1
                
    print(f"Concluído! {deleted_count} contatos zumbis deletados com sucesso.")
