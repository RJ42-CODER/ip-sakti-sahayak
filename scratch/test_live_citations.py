import json
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

query = {
    "question": "Can I patent a classical Ayurvedic formulation like Chawanprash in India?",
    "jurisdiction": "India"
}

print("=== LIVE QUERY CITATIONS VERIFICATION ===")
res = client.post("/api/query", json=query)
data = res.json()

print("Status Code:", res.status_code)
print("\nAnswer Snippet:\n", data.get("answer", "")[:250])
print("\nReturned Verified Citations Array:")
print(json.dumps(data.get("citations", []), indent=2))
