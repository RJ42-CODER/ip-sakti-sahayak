import json
import httpx

url = "http://127.0.0.1:8000/api/query"

queries = [
    {
        "name": "Chawanprash Patentability",
        "payload": {
            "question": "Can I patent a classical Ayurvedic formulation like Chawanprash in India?",
            "jurisdiction": "India"
        }
    },
    {
        "name": "NBA Plant Export",
        "payload": {
            "question": "Do I need NBA approval to export Indian medicinal plants for foreign commercial research?",
            "jurisdiction": "India"
        }
    },
    {
        "name": "TRIPS Article 27",
        "payload": {
            "question": "What does Article 27 of the TRIPS Agreement state regarding patent exclusions for therapeutic methods?",
            "jurisdiction": "International"
        }
    },
    {
        "name": "Neem Patent Case",
        "payload": {
            "question": "What happened in the Neem patent case and why was it revoked?",
            "jurisdiction": "International"
        }
    }
]

for q in queries:
    print(f"\n==========================================")
    print(f"Testing: {q['name']}")
    print(f"==========================================")
    try:
        res = httpx.post(url, json=q['payload'], timeout=30.0)
        print("Status Code:", res.status_code)
        if res.status_code == 200:
            print("Response JSON:")
            print(json.dumps(res.json(), indent=2))
        else:
            print("Error Response Text:")
            print(res.text)
    except Exception as e:
        print("HTTP Client Error:", e)
