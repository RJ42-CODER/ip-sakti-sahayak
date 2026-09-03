import json
import sys
from pathlib import Path

# Fix Windows cp1252 stdout encoding
sys.stdout.reconfigure(encoding='utf-8')

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

query = {
    "question": "Can I patent a classical Ayurvedic formulation like Chawanprash in India?",
    "jurisdiction": "India",
    "target_language": "Hindi"
}

print("=== TESTING POST /api/query WITH target_language: 'Hindi' ===")
res = client.post("/api/query", json=query)

print("Status Code:", res.status_code)
data = res.json()
print("\n--- FULL JSON RESPONSE ---")
print(json.dumps(data, indent=2, ensure_ascii=False))

# Also write to file so we can view/confirm directly
output_path = Path(__file__).resolve().parent / "hindi_response.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print(f"\nSaved full response to {output_path}")
