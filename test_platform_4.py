import requests
import json
import sqlite3

conn = sqlite3.connect('prisma/dev.db')
cur = conn.cursor()
cur.execute("SELECT value FROM Setting WHERE key = 'chatwoot_platform_token'")
token = cur.fetchone()[0]

cur.execute("SELECT value FROM Setting WHERE key = 'chatwoot_url'")
url_row = cur.fetchone()
url = url_row[0] if url_row else "https://chatwoot2.cristhiansancore.com.br"

res = requests.get(f"{url}/platform/api/v1/users", headers={"api_access_token": token})
users = res.json()
print(json.dumps(users[0], indent=2))
