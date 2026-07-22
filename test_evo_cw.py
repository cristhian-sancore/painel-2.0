import requests
evo_url = "https://api.cristhiansancore.com.br"
evo_key = "sancore_evolution_master_key_123"
cw_url = "https://chatwoot2.cristhiansancore.com.br"
cw_token = "WGMzdQwPraor579LG7o9NRcm"

print("Creating instance 'bot-test'...")
res = requests.post(f"{evo_url}/instance/create", headers={"apikey": evo_key, "Content-Type": "application/json"}, json={"instanceName": "bot-test", "qrcode": True, "integration": "WHATSAPP-BAILEYS"})
print(res.status_code, res.text)

print("Setting chatwoot...")
payload = {
    "enabled": True,
    "accountId": "1",
    "token": cw_token,
    "url": cw_url,
    "signMsg": True,
    "reopenConversation": True,
    "conversationPending": False,
    "nameInbox": "WhatsApp - bot-test",
    "mergeBrazilContacts": True,
    "importContacts": True,
    "importMessages": True,
    "daysLimitImportMessages": 3
}
res = requests.post(f"{evo_url}/chatwoot/set/bot-test", headers={"apikey": evo_key, "Content-Type": "application/json"}, json=payload)
print(res.status_code, res.text)
