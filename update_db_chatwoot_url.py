import sqlite3
conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()
c.execute('UPDATE Setting SET value="http://chatwoot-evolution-chatwoot-1:3000" WHERE key="chatwoot_url"')
conn.commit()
print("Updated!")
