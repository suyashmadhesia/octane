import requests

url = "http://localhost:3010/api/mine"
data = {"data": "data"}

for i in range(10):
    r = requests.post(url, json=data)
    print(r.text)