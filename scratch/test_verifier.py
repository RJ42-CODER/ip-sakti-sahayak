import json
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app
from app.rag_engine import verify_answer

client = TestClient(app)

print("==================================================")
print("  TEST 1: CHAWANPRASH QUERY (HAPPY PATH PASS)    ")
print("==================================================")
chawanprash_query = {
    "question": "Can I patent a classical Ayurvedic formulation like Chawanprash in India?",
    "jurisdiction": "India"
}
res1 = client.post("/api/query", json=chawanprash_query)
data1 = res1.json()
print("Status Code:", res1.status_code)
print(json.dumps(data1, indent=2))

print("\n==================================================")
print("  TEST 2: DIRECT VERIFIER AUDIT WITH OVERREACH    ")
print("==================================================")

# Construct a draft answer containing an unsupported claim (e.g. claiming Section 3(p) imposes a Rs 50 lakh fine for patenting Chawanprash)
overreach_answer = (
    "**No, you cannot patent Chawanprash in India.**\n\n"
    "Under Section 3(p) of the Patents Act, 1970, traditional knowledge formulations like Chawanprash cannot be patented. "
    "Filing a patent for Chawanprash will automatically trigger a mandatory criminal penalty of Rs 50 lakh and 5 years imprisonment under Section 3(p)."
)

sample_cited_chunks = [
    {
        "metadata": {"source_name": "Patents Act, 1970", "section": "Section 3(p)"},
        "text": "Section 3 of the Patents Act, 1970 details what are not inventions within the meaning of the Act. Specifically, Section 3(p) explicitly states that an invention which in effect, is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components is not an invention."
    }
]

audit_res = verify_answer(overreach_answer, sample_cited_chunks)
print("Groq Auditor Result for Overreach Answer:")
print(json.dumps(audit_res, indent=2))

print("\n==================================================")
print("  TEST 3: ADJACENT OVERREACH QUERY VIA ENDPOINT   ")
print("==================================================")
# Question asking about specific criminal fine penalties under Section 3(p)
overreach_query = {
    "question": "What is the exact monetary fine and prison sentence under Section 3(p) for trying to patent Chawanprash?",
    "jurisdiction": "India"
}
res3 = client.post("/api/query", json=overreach_query)
data3 = res3.json()
print("Status Code:", res3.status_code)
print(json.dumps(data3, indent=2))
