import requests

CHATWOOT_API_URL = "https://chatwoot2.cristhiansancore.com.br"
ACCESS_TOKEN = "WGMzdQwPraor579LG7o9NRcm"
ACCOUNT_ID = "2" # from what I know, but let's check dynamically

headers = {
    "api_access_token": ACCESS_TOKEN,
    "Content-Type": "application/json"
}

try:
    res = requests.get(f"{CHATWOOT_API_URL}/api/v1/profile", headers=headers, verify=False)
    account_id = res.json()["account_id"]
    print("Account ID:", account_id)
    
    # Check Teams
    res2 = requests.get(f"{CHATWOOT_API_URL}/api/v1/accounts/{account_id}/teams", headers=headers, verify=False)
    print("Teams:", res2.status_code, res2.text[:200])

    # Check Inboxes
    res3 = requests.get(f"{CHATWOOT_API_URL}/api/v1/accounts/{account_id}/inboxes", headers=headers, verify=False)
    print("Inboxes:", res3.status_code, res3.text[:200])

except Exception as e:
    print("Error:", e)
