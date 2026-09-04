import time
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

print("=== MEASURING BASELINE (BEFORE TASK 2) ===")
start_time = time.time()
res = client.post("/api/query", json=query)
elapsed = time.time() - start_time

data = res.json()
answer = data.get("answer", "")
word_count = len(answer.split())
char_count = len(answer)

print(f"Status: {res.status_code}")
print(f"Response Time: {elapsed:.2f} seconds")
print(f"Answer Length: {char_count} chars, {word_count} words")
print("\n--- BASELINE ANSWER ---")
print(answer)
