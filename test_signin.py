import requests

url = "https://chatwoot2.cristhiansancore.com.br/auth/sign_in"
payload = {
    "email": "cristhiansancore@gmail.com",
    "password": "Sancore@2404"
}
res = requests.post(url, json=payload)
print(res.status_code)
print(res.headers)
print(res.text)
