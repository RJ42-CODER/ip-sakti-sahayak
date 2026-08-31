import json
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

q1 = {
    "question": "Can I patent a classical Ayurvedic formulation like Chawanprash in India?",
    "jurisdiction": "India"
}

q2 = {
    "question": "Do I need NBA approval to export Indian medicinal plants for foreign commercial research?",
    "jurisdiction": "India"
}

print("=== QUESTION 1 (CHAWANPRASH) RESPONSE ===")
res1 = client.post("/api/query", json=q1)
print(json.dumps(res1.json(), indent=2))

print("\n=== QUESTION 2 (NBA APPROVAL) RESPONSE ===")
res2 = client.post("/api/query", json=q2)
print(json.dumps(res2.json(), indent=2))
