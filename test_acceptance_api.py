import json
import urllib.request

url = "http://localhost:8000/api/query"
payload = {
    "question": "Can I patent a classical Ayurvedic formulation like Chyawanprash in India?",
    "jurisdiction": "India"
}
data = json.dumps(payload).encode("utf-8")
req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})

with urllib.request.urlopen(req) as resp:
    res = json.loads(resp.read().decode("utf-8"))

debug = res.get("debug_info", {})
structured = res.get("structured_content") or {}

print("=" * 60)
print("ACCEPTANCE TEST FULL AUDIT TRACE")
print("=" * 60)
print(f"1. Normalized Query: {debug.get('normalized_query')}")
print(f"2. Intent: {debug.get('intent')}")
print(f"3. Goal: {debug.get('user_goal')}")
print(f"4. Jurisdiction: {debug.get('jurisdiction')}")
print(f"5. Retrieved Candidates:")
for r in debug.get("retrieved_sources", []):
    print(f"   - {r}")
print(f"6. Reranked Evidence & Scores:")
for s in debug.get("retrieval_scores", []):
    print(f"   - Section: {s.get('section')}, Score: {s.get('score'):.4f}")
print(f"7. Generated Claims:")
for c in debug.get("claims_extracted", []):
    print(f"   - {c}")
print(f"8. Claim Verification:")
for cs in debug.get("claim_support", []):
    print(f"   - [{cs.get('status')}] {cs.get('claim')} (sources: {cs.get('source_ids')})")
print(f"9. Citation Verification:")
for cit in debug.get("citation_checks", []):
    print(f"   - {cit.get('source')} | Sec: {cit.get('section')} | Domain: {cit.get('domain')} | URL: {cit.get('url')}")
print(f"10. Core-Conclusion Verification: {debug.get('core_conclusion_support')}")
print(f"11. Removed Claims: {debug.get('removed_claims')}")
print(f"    Reasons for Removal: {debug.get('reason_for_removal')}")
print(f"12. Final Structured Output:")
print(json.dumps(structured, indent=2))
print(f"13. Final Confidence / Status:")
print(f"    - Assessment Status: {res.get('assessment_status')}")
print(f"    - Evidence Confidence: {res.get('evidence_confidence')} (Confidence: {res.get('confidence')})")
print(f"    - Verdict: {structured.get('verdict')}")
print(f"    - Citations in Response: {[c.get('source_name') + ' - ' + c.get('section') for c in res.get('citations', [])]}")
print(f"    - Status: {res.get('status')}")
print("=" * 60)
