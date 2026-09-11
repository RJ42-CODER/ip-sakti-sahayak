import json
import sys
import uuid
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_test_suite():
    json_path = Path(__file__).resolve().parent / "intent_edge_cases.json"
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    test_cases = data["test_cases"]
    print("=" * 80)
    print(f"  RUNNING {len(test_cases)} REAL API INTENT & ROUTING ACCEPTANCE TESTS")
    print("=" * 80)
    print(f"{'TEST ID':<9} | {'EXPECTED':<17} | {'ACTUAL':<17} | {'RETR':<5} | {'SESS':<5} | {'RESULT'}")
    print("-" * 80)

    passed_count = 0
    failed_count = 0
    failed_tests = []

    for tc in test_cases:
        tc_id = tc["id"]
        expected_intent = tc["expected_intent"]
        should_retrieve = tc["should_retrieve"]
        should_use_session = tc["should_use_session"]
        should_clarify = tc["should_clarify"]
        should_block = tc["should_block"]

        # Create unique session for test isolation
        session_id = f"test_sess_{tc_id}_{uuid.uuid4().hex[:6]}"

        # If test case defines pre-existing session turns, execute them through real API
        session_history = tc.get("session", [])
        if session_history:
            for turn in session_history:
                if turn.get("role") == "user":
                    pre_payload = {
                        "question": turn.get("content", ""),
                        "jurisdiction": "India",
                        "session_id": session_id
                    }
                    client.post("/api/query", json=pre_payload)

        # Now send the primary test query to the REAL POST /api/query
        payload = {
            "question": tc["input"],
            "jurisdiction": "India",
            "session_id": session_id
        }

        res = client.post("/api/query", json=payload)
        if res.status_code != 200:
            failed_count += 1
            failed_tests.append((tc_id, f"HTTP Status {res.status_code}: {res.text}"))
            print(f"{tc_id:<9} | {expected_intent:<17} | HTTP_{res.status_code:<12} | {'-':<5} | {'-':<5} | FAIL")
            continue

        resp_data = res.json()
        debug_info = resp_data.get("debug_info") or {}

        actual_high_level = debug_info.get("high_level_intent") or debug_info.get("intent", "")
        actual_domain_intent = debug_info.get("domain_intent") or debug_info.get("domain_sub_intent", "")
        actual_retrieval = debug_info.get("requires_retrieval", False)
        actual_session = debug_info.get("requires_session", False)
        actual_clarify = debug_info.get("requires_clarification", False)
        actual_block = debug_info.get("blocked", False)

        # Exact logical match against explicit high-level taxonomy
        intent_matches = (actual_high_level == expected_intent)
        retrieval_matches = (actual_retrieval == should_retrieve)
        session_matches = (actual_session == should_use_session)
        clarify_matches = (actual_clarify == should_clarify)
        block_matches = (actual_block == should_block)

        is_pass = intent_matches and retrieval_matches and session_matches and clarify_matches and block_matches

        retr_str = "true" if actual_retrieval else "false"
        sess_str = "true" if actual_session else "false"

        if is_pass:
            passed_count += 1
            print(f"{tc_id:<9} | {expected_intent:<17} | {actual_high_level:<17} | {retr_str:<5} | {sess_str:<5} | PASS")
        else:
            failed_count += 1
            failure_reason = []
            if not intent_matches:
                failure_reason.append(f"intent: exp={expected_intent} got={actual_high_level}")
            if not retrieval_matches:
                failure_reason.append(f"retrieval: exp={should_retrieve} got={actual_retrieval}")
            if not session_matches:
                failure_reason.append(f"session: exp={should_use_session} got={actual_session}")
            if not clarify_matches:
                failure_reason.append(f"clarify: exp={should_clarify} got={actual_clarify}")
            if not block_matches:
                failure_reason.append(f"block: exp={should_block} got={actual_block}")

            failed_tests.append((tc_id, ", ".join(failure_reason)))
            print(f"{tc_id:<9} | {expected_intent:<17} | {actual_high_level:<17} | {retr_str:<5} | {sess_str:<5} | FAIL")

    print("-" * 80)
    print(f"TOTAL: {len(test_cases)} | PASSED: {passed_count} | FAILED: {failed_count}")
    print("=" * 80)

    if failed_tests:
        print("\nFAILURE DETAILS:")
        for fid, reason in failed_tests:
            print(f"  [{fid}]: {reason}")
        return False
    return True

# Pytest discovery functions
def test_all_intent_edge_cases():
    assert run_test_suite() is True

def test_session_isolation_guarantee():
    """Validates that context in Session A cannot contaminate Session B."""
    sess_a = f"sess_a_{uuid.uuid4().hex[:6]}"
    sess_b = f"sess_b_{uuid.uuid4().hex[:6]}"

    # Turn 1 in Session A
    res1 = client.post("/api/query", json={
        "question": "My product is Chyawanprash.",
        "jurisdiction": "India",
        "session_id": sess_a
    })
    assert res1.status_code == 200

    # Turn 2 in Session A: "Can I patent it?" -> Should resolve to Chyawanprash
    res2 = client.post("/api/query", json={
        "question": "Can I patent it?",
        "jurisdiction": "India",
        "session_id": sess_a
    })
    assert res2.status_code == 200
    debug_a = res2.json().get("debug_info", {})
    assert debug_a.get("intent") in ["FOLLOW_UP", "DOMAIN_LEGAL_IP", "patentability", "patent_procedure"]
    assert debug_a.get("requires_session") is True
    assert debug_a.get("requires_retrieval") is True

    # Same query in clean Session B: "Can I patent it?" -> MUST require CLARIFY
    res_b = client.post("/api/query", json={
        "question": "Can I patent it?",
        "jurisdiction": "India",
        "session_id": sess_b
    })
    assert res_b.status_code == 200
    resp_b_data = res_b.json()
    debug_b = resp_b_data.get("debug_info", {})
    assert resp_b_data.get("status") == "CLARIFY"
    assert debug_b.get("intent") == "CLARIFY"
    assert debug_b.get("requires_clarification") is True
    assert debug_b.get("requires_retrieval") is False

if __name__ == "__main__":
    success = run_test_suite()
    if not success:
        sys.exit(1)
