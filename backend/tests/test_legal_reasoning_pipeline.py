import pytest
import sys
import os
import re

from app.rag_engine import (
    process_query,
    QueryRequest,
    clear_cache,
    is_text_substantially_duplicate
)

@pytest.fixture(autouse=True)
def run_before_each_test():
    clear_cache()

def assert_output_integrity(res):
    """Universal invariant check across all responses"""
    # 1. No raw markdown characters in structured fields
    sc = res.structured_content
    if sc:
        for field_val in [sc.summary, sc.verdict, sc.core_verdict, sc.outcome]:
            if field_val:
                assert "###" not in field_val, f"Raw heading markdown in field: {field_val}"
                assert "```" not in field_val, f"Raw code fence in field: {field_val}"
                assert "<svg" not in field_val.lower(), f"Raw SVG artifact in field: {field_val}"
                assert "▼" not in field_val and "▶" not in field_val, f"Raw unicode arrow in field: {field_val}"

        # 2. No duplicate summary / core_verdict
        if sc.summary and sc.core_verdict:
            assert sc.summary.strip().lower() != sc.core_verdict.strip().lower(), "Summary and Core Verdict must not be identical"

    # 3. Citation domain integrity: organization must agree with domain
    for cit in res.citations:
        assert cit.url.startswith("http"), f"Citation URL must be a valid http URL: {cit.url}"
        s_low = cit.source_name.lower()
        dom = (cit.official_domain or "").lower()
        if "epo" in s_low or "european patent" in s_low:
            assert "epo.org" in dom or "epo.org" in cit.url
        elif "uspto" in s_low:
            assert "uspto.gov" in dom or "uspto.gov" in cit.url
        elif "wipo" in s_low or "pct" in s_low:
            assert "wipo.int" in dom or "wipo.int" in cit.url
        elif "tkdl" in s_low:
            assert "tkdl.res.in" in dom or "csir.res.in" in dom or "tkdl.res.in" in cit.url

    # 4. Invariant: Every SUPPORTED claim has a verified citation
    for clm in res.claims:
        if clm.claim_status == "SUPPORTED":
            assert clm.citation_verified is True, f"Claim marked SUPPORTED has unverified citation: {clm.claim}"

def test_A_classical_formulation_patentability():
    """Test A: Classical formulation patentability (The Core Acceptance Test)"""
    req = QueryRequest(
        question="Can I patent a classical Ayurvedic formulation like Chyawanprash in India?",
        jurisdiction="India"
    )
    res = process_query(req)
    
    debug = res.debug_info or {}
    assert debug.get("jurisdiction") == "India"
    assert debug.get("product") == "Chyawanprash"
    assert debug.get("intent") == "patentability"
    assert res.assessment_status == "POTENTIAL_ISSUE"
    assert res.evidence_confidence == "HIGH"
    assert res.confidence == "High"
    
    # Section 3(p) must appear in citations and legal basis
    assert any("3(p)" in c.section for c in res.citations), "Section 3(p) must appear in citations"
    assert any("3(p)" in lb for lb in (res.structured_content.legal_basis or [])), "Section 3(p) must appear in legal_basis"
    
    # Exclusions
    assert not any("3(a)" in c.section for c in res.citations), "Section 3(a) must NOT appear in citations"
    assert not any("3(d)" in c.section for c in res.citations), "Section 3(d) must NOT appear in citations"
    assert not any("3(h)" in c.section for c in res.citations), "Section 3(h) must NOT appear in citations"
    
    # No unconditional absolute statement
    assert "cannot be patented in india" not in res.answer.lower()
    assert debug.get("unsupported_claim_count") == 0
    assert debug.get("contradicted_claim_count") == 0
    assert debug.get("core_conclusion_support") in ["PASS", "QUALIFIED_OVERRIDE"]

    assert_output_integrity(res)

def test_B_tell_me_more_about_tkdl():
    """Test B: Tell me more about TKDL (Prior-Art Evidence Documentation)"""
    req = QueryRequest(
        question="Tell me more about the Traditional Knowledge Digital Library (TKDL) and its role in protecting Ayurvedic medicine.",
        jurisdiction="India"
    )
    res = process_query(req)
    assert res.status == "OK"
    assert any("tkdl" in c.source_name.lower() or "tkdl" in c.section.lower() for c in res.citations)
    assert_output_integrity(res)

def test_C_tk_aggregation():
    """Test C: TK aggregation / combination of known components"""
    req = QueryRequest(
        question="Can I patent a simple mixture of Ashwagandha and Brahmi combined together in India?",
        jurisdiction="India"
    )
    res = process_query(req)
    assert res.assessment_status == "POTENTIAL_ISSUE"
    assert any("3(p)" in c.section for c in res.citations)
    assert_output_integrity(res)

def test_D_new_dosage_form():
    """Test D: New dosage form / modified drug delivery"""
    req = QueryRequest(
        question="Can I patent a novel sustained-release liposomal tablet of curcumin with enhanced therapeutic efficacy in India?",
        jurisdiction="India"
    )
    res = process_query(req)
    assert res.status == "OK"
    debug = res.debug_info or {}
    assert debug.get("intent") == "patentability"
    assert any("patents act" in c.source_name.lower() for c in res.citations)
    assert_output_integrity(res)

def test_E_dc_regulatory_classification():
    """Test E: D&C regulatory classification (Section 3(a))"""
    req = QueryRequest(
        question="What is the statutory definition of an Ayurvedic drug under Section 3(a) of the Drugs and Cosmetics Act, 1940?",
        jurisdiction="India"
    )
    res = process_query(req)
    assert res.status == "OK"
    assert any("drugs and cosmetics" in c.source_name.lower() or "3(a)" in c.section for c in res.citations)
    assert "excludes classical medicines from patent" not in res.answer.lower()
    assert_output_integrity(res)

def test_F_follow_up_question():
    """Test F: Follow-up question using conversation session"""
    sess_id = "sess_test_doc_reg"
    req1 = QueryRequest(
        question="Can I patent an Ayurvedic herbal formulation in India?",
        jurisdiction="India",
        session_id=sess_id
    )
    res1 = process_query(req1)
    assert res1.status == "OK"
    
    req2 = QueryRequest(
        question="What documents are required?",
        jurisdiction="India",
        session_id=sess_id
    )
    res2 = process_query(req2)
    assert res2.status == "OK"
    debug2 = res2.debug_info or {}
    assert debug2.get("is_follow_up") is True
    assert_output_integrity(res2)

def test_G_us_jurisdiction_follow_up():
    """Test G: US jurisdiction follow-up"""
    sess_id = "sess_test_jur_change"
    req1 = QueryRequest(
        question="Can I patent an Ayurvedic formulation in India?",
        jurisdiction="India",
        session_id=sess_id
    )
    res1 = process_query(req1)
    
    req2 = QueryRequest(
        question="What about in the US?",
        jurisdiction="India",
        session_id=sess_id
    )
    res2 = process_query(req2)
    debug2 = res2.debug_info or {}
    assert debug2.get("resolved_jurisdiction") == "US"
    assert debug2.get("is_follow_up") is True
    assert_output_integrity(res2)

def test_H_trademark_query():
    """Test H: Trademark query (Section 9 generic name prohibition)"""
    req = QueryRequest(
        question="Can a business register a generic Sanskrit name like Triphala as an exclusive trademark under Section 9?",
        jurisdiction="India"
    )
    res = process_query(req)
    debug = res.debug_info or {}
    assert debug.get("intent") == "trademark"
    assert any("trade mark" in c.source_name.lower() or "9" in c.section for c in res.citations)
    assert not any("patents act" in c.source_name.lower() for c in res.citations)
    assert_output_integrity(res)

def test_I_gi_query():
    """Test I: GI query (Section 11 collective community rights)"""
    req = QueryRequest(
        question="Can an individual enterprise register a Geographical Indication for Navara rice in India?",
        jurisdiction="India"
    )
    res = process_query(req)
    debug = res.debug_info or {}
    assert debug.get("intent") == "gi"
    assert any("geographical indication" in c.source_name.lower() or "11" in c.section for c in res.citations)
    assert_output_integrity(res)

def test_J_biodiversity_abs():
    """Test J: Biodiversity/ABS approval under Biological Diversity Act"""
    req = QueryRequest(
        question="Do foreign entities need National Biodiversity Authority NBA approval for Indian medicinal plant research?",
        jurisdiction="India"
    )
    res = process_query(req)
    debug = res.debug_info or {}
    assert debug.get("intent") == "biodiversity_abs"
    assert any("biological diversity" in c.source_name.lower() for c in res.citations)
    assert_output_integrity(res)

def test_K_unsupported_garbage_query():
    """Test K: Unsupported/garbage query triggers abstention / low confidence"""
    req = QueryRequest(
        question="Under Section 999 of the 2099 Cosmic Act, can I patent time travel using Ayurvedic planetary astrology?",
        jurisdiction="India"
    )
    res = process_query(req)
    assert res.confidence == "Low" or res.status == "ABSTAIN" or res.assessment_status in ["INSUFFICIENT_EVIDENCE", "UNCERTAIN"]
    assert res.escalate_available is True
    assert_output_integrity(res)
