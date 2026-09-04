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
from app.rag_engine import check_translation_appropriateness

client = TestClient(app)

print("==================================================")
print("  TASK 1 & 2: TRANSLATION HARDENING VERIFICATION  ")
print("==================================================")

# 1. Test check_translation_appropriateness directly
print("\n--- Test Direct Appropriateness Auditor ---")
clean_hindi_sample = "नहीं, आप भारत में च्यवनप्राश जैसे शास्त्रीय आयुर्वेदिक योगों का पेटेंट नहीं करा सकते हैं।"
res_clean = check_translation_appropriateness(clean_hindi_sample)
print(f"Appropriateness on clean text: {res_clean} (Expected: True)")

inappropriate_sample = "यह पूरी तरह से बकवास और मूर्खतापूर्ण कानून है, गाली-गलौज और घटिया बकवास।"
res_bad = check_translation_appropriateness(inappropriate_sample)
print(f"Appropriateness on offensive/crude text: {res_bad} (Expected: False)")

# 2. Run full Chawanprash query with target_language: "Hindi"
print("\n--- Testing Full POST /api/query (Chawanprash, Hindi) ---")
query = {
    "question": "Can I patent a classical Ayurvedic formulation like Chawanprash in India?",
    "jurisdiction": "India",
    "target_language": "Hindi"
}

res = client.post("/api/query", json=query)
print("Status Code:", res.status_code)
data = res.json()

print("\n--- RESPONSE SUMMARY ---")
print("Confidence:", data.get("confidence"))
print("Escalate Available:", data.get("escalate_available"))
print("Citations Count:", len(data.get("citations", [])))
print("English Answer Present:", bool(data.get("answer")))
print("Translated Answer Present:", bool(data.get("translated_answer")))

print("\n--- ENGLISH ANSWER SNIPPET ---")
print(data.get("answer", "")[:180] + "...")

print("\n--- TRANSLATED ANSWER ---")
print(data.get("translated_answer"))
