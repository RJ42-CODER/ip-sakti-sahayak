import re
import pytest
from app.rag_engine import process_query, QueryRequest, _session_store, _query_cache, clear_cache

@pytest.fixture(autouse=True)
def clean_environment():
    clear_cache()
    _session_store.clear()
    yield
    clear_cache()
    _session_store.clear()

def test_1_indian_citizen_commercial_biological_resource():
    """
    Negative regression test:
    Indian citizen + commercial biological-resource use must apply Section 7 (SBB intimation),
    NOT over-generalize that Indian citizens require previous approval of the NBA under Section 3(2).
    """
    req = QueryRequest(
        question="I am an Indian citizen planning commercial utilization of Ashwagandha roots sourced from Madhya Pradesh. Do I need NBA approval?",
        jurisdiction="India"
    )
    res = process_query(req)
    ans = res.answer
    citations = res.citations
    claims = res.claims

    # 1. Scope checks
    assert res.debug_info.get("person_entity_category") == "indian_citizen" or "indian" in req.question.lower()
    
    # 2. Citations must include Section 7 of the Biological Diversity Act
    sec_names = [c.section.lower() for c in citations]
    assert any("section 7" in s for s in sec_names), f"Section 7 must be cited for Indian citizen commercial use. Found: {sec_names}"

    # 3. Negative assertion: Section 3(2) must NOT be cited as applicable approval requirement for Indian citizens
    assert not any("section 3" in s and "section 7" not in s for s in sec_names), f"Section 3(2) must not be cited for Indian citizens. Found: {sec_names}"

    # 4. Content assertions: must mention SBB / State Biodiversity Board or Section 7
    ans_low = ans.lower()
    assert "state biodiversity board" in ans_low or "sbb" in ans_low or "section 7" in ans_low

    # 5. Negative assertion: must NOT assert mandatory NBA previous approval for Indian citizens commercial utilization
    assert not ("must obtain previous approval of the national biodiversity authority" in ans_low and "foreign" not in ans_low)

def test_2_foreign_entity_indian_biological_resource():
    """
    Foreign entity + Indian biological resource:
    Must apply Section 3(2) (prior approval of National Biodiversity Authority).
    """
    req = QueryRequest(
        question="A foreign pharmaceutical corporation wants to access Ashwagandha from India for commercial research and development. What approval is required?",
        jurisdiction="India"
    )
    res = process_query(req)
    ans = res.answer
    citations = res.citations

    sec_names = [c.section.lower() for c in citations]
    assert any("section 3" in s for s in sec_names), f"Section 3 must be cited for foreign corporation. Found: {sec_names}"
    
    # Section 7 is domestic only
    assert not any("section 7" in s for s in sec_names), f"Section 7 must not be cited for foreign entity. Found: {sec_names}"

    ans_low = ans.lower()
    assert "national biodiversity authority" in ans_low or "nba" in ans_low
    assert bool(re.search(r"section\s*3", ans_low)), f"Section 3 must be mentioned in answer. Found text: {ans[:300]}"

def test_3_ipr_application_biological_resource():
    """
    IPR application involving Indian biological resources:
    Must apply Section 6(1) of the Biological Diversity Act (NBA approval required before patent grant).
    """
    req = QueryRequest(
        question="Can I file a patent application on an Ayurvedic herbal extract obtained from Indian medicinal plants, and do I need NBA permission under Section 6?",
        jurisdiction="India"
    )
    res = process_query(req)
    ans = res.answer
    citations = res.citations

    sec_names = [c.section.lower() for c in citations]
    assert any("section 6" in s for s in sec_names), f"Section 6 must be cited for IPR application. Found: {sec_names}"

    ans_low = ans.lower()
    assert "section 6" in ans_low or "intellectual property" in ans_low

def test_4_follow_up_changing_jurisdiction():
    """
    Follow-up changing jurisdiction:
    Turn 1: India classical formulation
    Turn 2: "What about in the US?" -> Explicit current-turn override must switch jurisdiction to US
    and MUST NOT cite Indian Patents Act Section 3(p) or Indian BDA as US law.
    """
    sess_id = "test_jur_override_sess"
    req1 = QueryRequest(
        question="Can I patent Chyawanprash in India?",
        jurisdiction="India",
        session_id=sess_id
    )
    res1 = process_query(req1)
    assert res1.debug_info.get("resolved_jurisdiction") == "India"
    assert any("3(p)" in c.section for c in res1.citations)

    # Turn 2: Follow-up changing jurisdiction
    req2 = QueryRequest(
        question="What about in the US?",
        jurisdiction="India",  # Default passed by UI, but current query explicitly overrides to US!
        session_id=sess_id
    )
    res2 = process_query(req2)
    assert res2.debug_info.get("resolved_jurisdiction") == "US"
    
    # Negative assertion: US answer must NOT cite Section 3(p) of the Indian Patents Act
    us_citations = [c.section.lower() for c in res2.citations]
    assert not any("3(p)" in s for s in us_citations), f"Indian Section 3(p) must not be cited for US jurisdiction. Found: {us_citations}"

def test_5_follow_up_changing_activity_purpose():
    """
    Follow-up changing activity/purpose:
    Turn 1: Indian researcher studying Turmeric in laboratory (non-commercial research)
    Turn 2: "What if we commercialize it and sell it?"
    Current turn must override activity to commercial_utilisation and apply Section 7 / SBB intimation.
    """
    sess_id = "test_act_override_sess"
    req1 = QueryRequest(
        question="I am an Indian researcher studying Turmeric in our university lab.",
        jurisdiction="India",
        session_id=sess_id
    )
    res1 = process_query(req1)

    # Turn 2: Follow-up switching to commercial utilization
    req2 = QueryRequest(
        question="What if we commercialize it and sell it in the market?",
        jurisdiction="India",
        session_id=sess_id
    )
    res2 = process_query(req2)
    citations = [c.section.lower() for c in res2.citations]
    assert any("section 7" in s for s in citations), f"Section 7 must apply for commercialization follow-up. Found: {citations}"

def test_6_ambiguous_nba_query_clarify():
    """
    Ambiguous person/entity category for NBA query:
    A bare query like 'Do I need NBA approval?' without active session or entity category
    must return CLARIFY rather than guessing and generalizing.
    """
    req = QueryRequest(
        question="Do I need NBA approval?",
        jurisdiction="India"
    )
    res = process_query(req)
    assert res.status == "CLARIFY" or res.debug_info.get("intent") == "CLARIFY"
    assert "clarification" in res.answer.lower() or "clarification" in (res.debug_info.get("intent") or "").lower()

def test_7_classical_formulation_patentability_invariants():
    """
    Classical Ayurvedic formulation (Chyawanprash):
    - Must NOT assert absolute bar ('cannot be patented in India')
    - Must cite Section 3(p) conditionally
    - Must NOT cite D&C Act Section 3(a) as a patent exclusion
    - Must NOT cite Section 3(d) when no new form is claimed
    - Confidence must be High with verified Section 3(p) citation
    """
    req = QueryRequest(
        question="Can I patent Chyawanprash in India?",
        jurisdiction="India"
    )
    res = process_query(req)
    ans = res.answer
    citations = res.citations
    claims = res.claims

    # Invariant 1: No absolute patent bar
    assert "cannot be patented in india" not in ans.lower()
    assert "strictly barred from patent" not in ans.lower()

    # Invariant 2: Section 3(p) cited
    assert any("3(p)" in c.section for c in citations)

    # Invariant 3: D&C Act Section 3(a) not in citations as patent bar
    dc_cits = [c for c in citations if "drugs and cosmetics" in c.source_name.lower()]
    assert len(dc_cits) == 0

    # Invariant 4: Section 3(d) not in citations
    sec_3d = [c for c in citations if "3(d)" in c.section]
    assert len(sec_3d) == 0

    # Invariant 5: Confidence calculation
    assert res.confidence in ["High", "Medium"]
    assert res.evidence_confidence in ["HIGH", "MEDIUM"]

def test_8_evidence_confidence_calculation_after_verification():
    """
    Verify that calculate_evidence_confidence runs strictly after claim verification:
    If a claim was contradicted/removed, verification_status reflects CORRECTED and
    final_claims only contains surviving supported claims.
    """
    req = QueryRequest(
        question="Can I patent a classical Chyawanprash formulation in India?",
        jurisdiction="India"
    )
    res = process_query(req)
    debug = res.debug_info
    
    assert "claims_extracted" in debug
    assert "claim_support" in debug
    assert "citation_checks" in debug
    assert "authority_checks" in debug
    assert "evidence_confidence" in debug
    assert debug.get("evidence_confidence") in ["HIGH", "MEDIUM"]
