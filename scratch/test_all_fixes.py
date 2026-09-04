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

print("==================================================")
print("  POST-TASK-2 BENCHMARK & TASK 4 SAFEGUARD TEST   ")
print("==================================================")

# 1. Chawanprash Query Benchmark (Task 2)
query_chawanprash = {
    "question": "Can I patent a classical Ayurvedic formulation like Chawanprash in India?",
    "jurisdiction": "India"
}

start_time = time.time()
res1 = client.post("/api/query", json=query_chawanprash)
elapsed = time.time() - start_time

data1 = res1.json()
answer1 = data1.get("answer", "")
word_count = len(answer1.split())
char_count = len(answer1)

print("\n--- CHAWANPRASH QUERY RESULTS (AFTER TASK 2) ---")
print(f"Status Code: {res1.status_code}")
print(f"Response Time: {elapsed:.2f} seconds")
print(f"Answer Length: {char_count} chars, {word_count} words")
print(f"Citations Count: {len(data1.get('citations', []))}")
print(f"Translated Answer is None (no language requested): {data1.get('translated_answer') is None}")
print("\nAnswer Text:")
print(answer1)

# 2. Out-of-Scope Pre-check Test (Task 4)
query_out_of_scope = {
    "question": "How do I calculate corporate income tax for a software IT export company?",
    "jurisdiction": "India"
}

res2 = client.post("/api/query", json=query_out_of_scope)
data2 = res2.json()

print("\n--- OUT-OF-SCOPE PRE-CHECK TEST (TASK 4) ---")
print(f"Question: {query_out_of_scope['question']}")
print(f"Status Code: {res2.status_code}")
print(f"Confidence: {data2.get('confidence')}")
print(f"Escalate Available: {data2.get('escalate_available')}")
print(f"Answer Text: {data2.get('answer')}")

# 3. Weak-context Test (in-domain keywords, but insufficient corpus context)
query_weak_context = {
    "question": "What is the specific patent filing deadline in Brazil for Ayurvedic veterinary compositions under local Brazilian decree?",
    "jurisdiction": "International"
}

res3 = client.post("/api/query", json=query_weak_context)
data3 = res3.json()

print("\n--- WEAK-CONTEXT TEST (TASK 4) ---")
print(f"Question: {query_weak_context['question']}")
print(f"Status Code: {res3.status_code}")
print(f"Answer Text: {data3.get('answer')}")
