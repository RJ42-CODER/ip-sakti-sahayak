# Project Walkthrough — IP-SAKTI Sahayak

---

## 2026-08-28: Initial Project Skeleton & Documentation Setup

### Work Completed
1. Created base project repository structure containing `/backend`, `/frontend`, and `/docs` folders.
2. Initialized documentation suite (`CODEBASE_MAP.md`, `DECISIONS.md`, `walkthrough.md`) in `/docs`.
3. Scaffolded basic FastAPI backend structure (`main.py`, `requirements.txt`).
4. Scaffolded React/Vite frontend structure (`App.jsx`, `package.json`).

---

## 2026-08-30: Corpus Ingestion Pipeline

### Work Completed
1. Loaded and verified 12 base corpus entries and 13 extended legal entries across National and International jurisdictions in `/data`.
2. Created vector ingestion script `backend/app/ingestion.py` using HuggingFace `sentence-transformers` (`all-MiniLM-L6-v2`) and local ChromaDB persistence (`./backend/chroma_db`).

---

## 2026-08-31: Real LLM Wiring, Citation Precision & Deterministic Groq Verification

### Work Completed
1. **Scenario Application & Verification Consistency**:
   - Added explicit rule to `verify_answer()` system prompt in `backend/app/rag_engine.py`:
     > *"Applying a general rule or definition from the source text to the specific product/scenario named in the user's question is VALID and should be marked supported... Only flag a claim as unsupported if it asserts something the source text does not establish even in general terms..."*
   - Set `temperature=0.0` for `verify_answer()` API calls using `openai/gpt-oss-20b`.

### Repeatability Verification Results
- **Chawanprash Happy-Path Query (Run 1 & Run 2)**:
  - Both runs returned `all_claims_supported: true`, `confidence: "High"`, `escalate_available: false`.
  - Zero false-positive flags on valid product scenario application.
- **Subtle GST-Injection Query (Run 1 & Run 2)**:
  - Both runs returned `all_claims_supported: false`.
  - Both runs cited the exact unsupported claim: `["all traditional Ayurvedic manufacturers of Chawanprash are legally exempt from GST registration and commercial sales tax in India"]`.
