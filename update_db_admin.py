import sqlite3

conn = sqlite3.connect('dev.db')
cur = conn.cursor()
cur.execute("UPDATE User SET chatwootAccessToken = 'i9Ch9WjTicBEyfBtiqqNukZS', chatwootId = 1 WHERE email = 'cristhiansancore@gmail.com'")
conn.commit()
conn.close()
print("Token updated for admin in DB!")
