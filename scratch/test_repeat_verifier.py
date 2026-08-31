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
print("  TEST 1: CHAWANPRASH HAPPY PATH (RUN 1 & RUN 2)  ")
print("==================================================")

chawanprash_query = {
    "question": "Can I patent a classical Ayurvedic formulation like Chawanprash in India?",
    "jurisdiction": "India"
}

res1_a = client.post("/api/query", json=chawanprash_query)
data1_a = res1_a.json()
print("--- Run 1 ---")
print("Confidence:", data1_a.get("confidence"))
print("Escalate Available:", data1_a.get("escalate_available"))
print("Has Caveat Flag:", "*Note: Parts of this answer" in data1_a.get("answer", ""))
print("Citations:", [c["section"] for c in data1_a.get("citations", [])])

res1_b = client.post("/api/query", json=chawanprash_query)
data1_b = res1_b.json()
print("\n--- Run 2 ---")
print("Confidence:", data1_b.get("confidence"))
print("Escalate Available:", data1_b.get("escalate_available"))
print("Has Caveat Flag:", "*Note: Parts of this answer" in data1_b.get("answer", ""))
print("Citations:", [c["section"] for c in data1_b.get("citations", [])])

print("\n==================================================")
print("  TEST 2: SUBTLE GST INJECTION (RUN 1 & RUN 2)   ")
print("==================================================")

subtle_draft_answer = (
    "**No, you cannot patent a classical Ayurvedic formulation like Chawanprash in India.**\n\n"
    "Under Section 3(p) of the Patents Act, 1970, classical Ayurvedic formulations are considered traditional knowledge "
    "and are strictly excluded from patent protection.\n\n"
    "Additionally, because Chawanprash is classified as a classical medicine under Section 3(a) of the Drugs and Cosmetics Act, "
    "all traditional Ayurvedic manufacturers of Chawanprash are legally exempt from GST registration and commercial sales tax in India."
)

sample_cited_chunks = [
    {
        "metadata": {"source_name": "Patents Act, 1970", "section": "Section 3(p)"},
        "text": "Section 3 of the Patents Act, 1970 details what are not inventions within the meaning of the Act. Specifically, Section 3(p) explicitly states that an invention which in effect, is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components is not an invention."
    },
    {
        "metadata": {"source_name": "Drugs and Cosmetics Act, 1940", "section": "Section 3(a)"},
        "text": "The Drugs and Cosmetics Act, 1940, under Section 3(a), defines an Ayurvedic, Siddha or Unani drug. It includes all medicines intended for internal or external use for or in the diagnosis, treatment, mitigation or prevention of disease or disorder in human beings or animals, and manufactured exclusively in accordance with the formulae described in the authoritative books of Ayurvedic, Siddha and Unani Tibb systems of medicine, specified in the First Schedule of the Act."
    }
]

audit_res_a = verify_answer(subtle_draft_answer, sample_cited_chunks)
print("--- Run 1 Audit Result ---")
print(json.dumps(audit_res_a, indent=2))

audit_res_b = verify_answer(subtle_draft_answer, sample_cited_chunks)
print("\n--- Run 2 Audit Result ---")
print(json.dumps(audit_res_b, indent=2))
