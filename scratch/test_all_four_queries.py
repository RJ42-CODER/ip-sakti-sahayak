import json
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app, raise_server_exceptions=True)

test_cases = [
    {
        "name": "Original Chawanprash Query",
        "payload": {
            "question": "Can I patent a classical Ayurvedic formulation like Chawanprash in India?",
            "jurisdiction": "India"
        }
    },
    {
        "name": "Sample Query 1: NBA Plant Export Approval",
        "payload": {
            "question": "Do I need NBA approval to export Indian medicinal plants for foreign commercial research?",
            "jurisdiction": "India"
        }
    },
    {
        "name": "Sample Query 2: TRIPS Article 27 Exclusions",
        "payload": {
            "question": "What does Article 27 of the TRIPS Agreement state regarding patent exclusions for therapeutic methods?",
            "jurisdiction": "International"
        }
    },
    {
        "name": "Sample Query 3: Neem Patent Case Study",
        "payload": {
            "question": "What happened in the Neem patent case and why was it revoked?",
            "jurisdiction": "International"
        }
    }
]

print("==================================================")
print("  EXECUTING ALL 4 QUERIES TEST SUITE              ")
print("==================================================")

for test in test_cases:
    print(f"\n--- Testing: {test['name']} ---")
    print(f"Payload: {json.dumps(test['payload'])}")
    try:
        res = client.post("/api/query", json=test['payload'])
        print("Status Code:", res.status_code)
        data = res.json()
        
        # Verify JSON keys
        required_keys = ["answer", "confidence", "citations", "disclaimer", "escalate_available"]
        missing_keys = [k for k in required_keys if k not in data]
        
        if missing_keys:
            print("FAILED: Missing JSON Keys:", missing_keys)
        else:
            print("SUCCESS: Full expected JSON shape matched.")
            print(f"Confidence: {data['confidence']}")
            print(f"Citations Count: {len(data['citations'])}")
            print(f"Escalate Available: {data['escalate_available']}")
            print(f"Answer snippet: {data['answer'][:120]}...")
    except Exception as e:
        print("EXCEPTIONAL ERROR CAUGHT:")
        import traceback
        traceback.print_exc()
