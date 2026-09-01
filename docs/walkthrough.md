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
1. **Model Architecture & Prompting**:
   - Integrated Gemini API (`models/gemini-2.5-flash`) with Groq fallback.
   - Enforced standalone bolded first line outcomes and scenario application.
2. **Strict Section Citation Matcher**:
   - Refined `is_doc_cited_in_answer()` so only chunks whose specific section numbers are mentioned in the answer appear in `citations`.
3. **Independent Verification Auditor (`verify_answer`)**:
   - Built `verify_answer(draft_answer, cited_chunks)` in `backend/app/rag_engine.py` using Groq API (`openai/gpt-oss-20b`, temperature=0.0).

---

## 2026-09-01: Verified Citation URLs Update, FSSAI Audit & Escalation Contact Details

### Work Completed
1. **Verified Statutory URLs Update**:
   - Updated `source_url` for all 8 National Acts across `ayurveda_corpus_base.json` and `ayurveda_corpus_extended.json`:
     - Patents Act, 1970 → `https://ipindia.gov.in/acts/patent-act-1970`
     - Biological Diversity Act, 2002 → `https://indiacode.gov.in/act/000de0a3-39ce-4e18-85f0-0c51b4bdab5d/sections`
     - Designs Act, 2000 → `https://indiacode.gov.in/act/cd8f2852-7085-432b-a264-7b73a6f01fff/sections`
     - Trade Marks Act, 1999 → `https://indiacode.gov.in/act/62219d21-0553-405b-9ccb-a11b4d9c41c2/sections`
     - Copyright Act, 1957 → `https://indiacode.gov.in/act/6b893162-631a-453b-a7b9-89685716889b/sections`
     - PPV&FR Act, 2001 → `https://indiacode.gov.in/act/66408705-b196-477f-9229-dc633f393a23/sections`
     - GI Act, 1999 → `https://indiacode.gov.in/act/1905d861-7dcd-46d6-a03b-4fe6009dea5b/sections`
     - Drugs and Cosmetics Act, 1940 → `https://indiacode.gov.in/act/8725a8a7-45a4-42e3-9046-e2a6383cd049/sections`
2. **FSSAI Entry Verification**:
   - Audited FSSAI Ayurveda-Aahar Regulations entry: confirmed URL is set to `https://www.fssai.gov.in/` (subordinate regulatory portal rather than primary legislation).
3. **Re-ingested Vector Database**:
   - Executed `python backend/app/ingestion.py` — re-embedded 25 chunks and persisted updated metadata in ChromaDB (`./backend/chroma_db`).
4. **Escalation Modal Contact Info**:
   - Updated `frontend/src/App.jsx` to render official Ministry of Ayush nodal contact details:
     - *Ministry of Ayush, Ayush Bhawan, B Block, GPO Complex, INA, New Delhi - 110023*
     - *Phone: 011-24651942 | Email: support-moayush@nic.in | Web: ayush.gov.in*
5. **Live Verification**:
   - Executed live API query: returned updated citation URLs cleanly in live response (`https://ipindia.gov.in/acts/patent-act-1970` and `https://indiacode.gov.in/act/8725a8a7-45a4-42e3-9046-e2a6383cd049/sections`).
