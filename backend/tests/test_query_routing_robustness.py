import pytest
from app.rag_engine import process_query, QueryRequest

def test_greeting_hii():
    resp = process_query(QueryRequest(question="Hii", jurisdiction="India"))
    assert resp.status == "OK"
    assert resp.debug_info.get("high_level_intent") == "GREETING"
    assert len(resp.citations) == 0

def test_greeting_can_you_help_me():
    resp = process_query(QueryRequest(question="Can you help me?", jurisdiction="India"))
    assert resp.status == "OK"
    assert resp.debug_info.get("high_level_intent") == "GREETING"
    assert len(resp.citations) == 0

def test_conceptual_prior_art():
    resp = process_query(QueryRequest(question="What is prior art?", jurisdiction="India"))
    assert resp.status in ["OK", "PARTIAL_EVIDENCE", "POTENTIAL_ISSUE"]
    assert "prior art" in resp.answer.lower()
    assert resp.debug_info.get("high_level_intent") == "DOMAIN_LEGAL_IP"

def test_conceptual_copyright_protection():
    resp = process_query(QueryRequest(question="What is copyright protection?", jurisdiction="India"))
    assert resp.status in ["OK", "PARTIAL_EVIDENCE", "POTENTIAL_ISSUE"]
    assert resp.debug_info.get("high_level_intent") == "DOMAIN_LEGAL_IP"

def test_conceptual_design_protection():
    resp = process_query(QueryRequest(question="What is design protection?", jurisdiction="India"))
    assert resp.status in ["OK", "PARTIAL_EVIDENCE", "POTENTIAL_ISSUE"]
    assert resp.debug_info.get("high_level_intent") == "DOMAIN_LEGAL_IP"

def test_procedural_patent_documents():
    resp = process_query(QueryRequest(question="What documents are required for a patent application?", jurisdiction="India"))
    assert resp.status in ["OK", "PARTIAL_EVIDENCE", "POTENTIAL_ISSUE"]
    assert resp.debug_info.get("high_level_intent") == "DOMAIN_LEGAL_IP"

def test_comparison_patent_vs_trademark():
    resp = process_query(QueryRequest(question="Patent vs trademark?", jurisdiction="India"))
    assert resp.status in ["OK", "PARTIAL_EVIDENCE", "POTENTIAL_ISSUE"]
    assert resp.debug_info.get("high_level_intent") == "DOMAIN_LEGAL_IP"

def test_comparison_patent_vs_gi():
    resp = process_query(QueryRequest(question="Patent vs GI?", jurisdiction="India"))
    assert resp.status in ["OK", "PARTIAL_EVIDENCE", "POTENTIAL_ISSUE"]
    assert resp.debug_info.get("high_level_intent") == "DOMAIN_LEGAL_IP"

def test_comparison_copyright_vs_design():
    resp = process_query(QueryRequest(question="Copyright vs design registration?", jurisdiction="India"))
    assert resp.status in ["OK", "PARTIAL_EVIDENCE", "POTENTIAL_ISSUE"]
    assert resp.debug_info.get("high_level_intent") == "DOMAIN_LEGAL_IP"

def test_comparison_india_vs_us_patentability():
    resp = process_query(QueryRequest(question="India vs US patentability?", jurisdiction="India"))
    assert resp.status in ["OK", "PARTIAL_EVIDENCE", "POTENTIAL_ISSUE"]
    assert resp.debug_info.get("high_level_intent") == "DOMAIN_LEGAL_IP"

def test_comparison_nba_sec3_vs_sec7():
    resp = process_query(QueryRequest(question="NBA Section 3 vs Section 7?", jurisdiction="India"))
    assert resp.status in ["OK", "PARTIAL_EVIDENCE", "POTENTIAL_ISSUE"]
    assert resp.debug_info.get("high_level_intent") == "DOMAIN_LEGAL_IP"

def test_conceptual_why_jurisdiction_matters():
    resp = process_query(QueryRequest(question="Why does jurisdiction matter?", jurisdiction="India"))
    assert resp.status in ["OK", "PARTIAL_EVIDENCE", "POTENTIAL_ISSUE"]
    assert resp.debug_info.get("high_level_intent") == "DOMAIN_LEGAL_IP"

def test_out_of_scope_poem():
    resp = process_query(QueryRequest(question="Write me a poem.", jurisdiction="India"))
    assert resp.debug_info.get("high_level_intent") == "OUT_OF_SCOPE" or "outside" in resp.answer.lower()

def test_out_of_scope_math():
    resp = process_query(QueryRequest(question="Solve this math problem.", jurisdiction="India"))
    assert resp.debug_info.get("high_level_intent") == "OUT_OF_SCOPE" or "outside" in resp.answer.lower()

def test_out_of_scope_joke():
    resp = process_query(QueryRequest(question="Tell me a joke.", jurisdiction="India"))
    assert resp.debug_info.get("high_level_intent") == "OUT_OF_SCOPE" or "outside" in resp.answer.lower()

def test_out_of_scope_non_ip_comparison():
    resp = process_query(QueryRequest(question="Python vs Java?", jurisdiction="India"))
    assert resp.debug_info.get("high_level_intent") == "OUT_OF_SCOPE" or "outside" in resp.answer.lower()

def test_ambiguity_gate_preserved_what_protection():
    # Constraint 2: genuinely ambiguous questions must CLARIFY
    resp = process_query(QueryRequest(question="What protection do I get?", jurisdiction="India"))
    assert resp.status == "CLARIFY"
    assert "clarification" in resp.answer.lower()

def test_typo_normalization_patnt():
    resp = process_query(QueryRequest(question="can i patnt chyawanprash", jurisdiction="India"))
    assert resp.status in ["OK", "PARTIAL_EVIDENCE", "POTENTIAL_ISSUE"]
    assert "patent" in resp.answer.lower() or "chyawanprash" in resp.answer.lower()

def test_typo_normalization_trips_art():
    resp = process_query(QueryRequest(question="trips art 27", jurisdiction="International"))
    assert resp.status in ["OK", "PARTIAL_EVIDENCE", "POTENTIAL_ISSUE"]
    assert "article 27" in resp.answer.lower() or "trips" in resp.answer.lower()

def test_context_override_us_jurisdiction():
    sess_id = "sess_reg_override_us"
    # Seed session with turn 1
    process_query(QueryRequest(
        question="Can I patent an Ayurvedic herbal extract obtained from Indian medicinal plants in India?",
        jurisdiction="India",
        session_id=sess_id
    ))
    # Turn 2: override to US
    resp = process_query(QueryRequest(
        question="Earlier I said India, but now I want the US.",
        jurisdiction="India",
        session_id=sess_id
    ))
    assert resp.debug_info.get("resolved_jurisdiction") == "US"
    assert resp.status in ["OK", "PARTIAL_EVIDENCE", "POTENTIAL_ISSUE"]

def test_context_override_research_activity():
    sess_id = "sess_reg_override_res"
    # Seed session with commercial use of Ashwagandha
    process_query(QueryRequest(
        question="I am an Indian citizen planning commercial utilization of Ashwagandha roots in India.",
        jurisdiction="India",
        session_id=sess_id
    ))
    # Turn 2: override to research
    resp = process_query(QueryRequest(
        question="Earlier this was commercial use, but now assume it is research instead.",
        jurisdiction="India",
        session_id=sess_id
    ))
    assert resp.debug_info.get("activity") == "research"
    assert resp.status in ["OK", "PARTIAL_EVIDENCE", "POTENTIAL_ISSUE"]
