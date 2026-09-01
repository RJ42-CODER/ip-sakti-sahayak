import sys
import traceback
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app, raise_server_exceptions=True)

query = {
    "question": "Can I patent a classical Ayurvedic formulation like Chawanprash in India?",
    "jurisdiction": "India"
}

print("=== REPRODUCING POST /api/query ===")
try:
    res = client.post("/api/query", json=query)
    print("Status Code:", res.status_code)
    print("Response JSON:", res.json())
except Exception as e:
    print("EXCEPTIONAL ERROR CAUGHT DURING REQUEST:")
    traceback.print_exc()
