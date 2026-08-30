# Project Walkthrough — IP-SAKTI Sahayak

---

## 2026-08-28: Initial Project Skeleton & Documentation Setup

### Work Completed
1. Created base project repository structure containing `/backend`, `/frontend`, and `/docs` folders.
2. Initialized documentation suite (`CODEBASE_MAP.md`, `DECISIONS.md`, `walkthrough.md`) in `/docs`.
3. Scaffolded basic FastAPI backend structure (`main.py`, `requirements.txt`).
4. Scaffolded React/Vite frontend structure (`App.jsx`, `package.json`).

---

## 2026-08-30: Corpus Ingestion & RAG Query / Product Classification Endpoints

### Work Completed
1. **Corpus File Verification & Extension**:
   - Preserved 12 base verified legal entries in `data/ayurveda_corpus_base.json`.
   - Verified and added 13 extended entries in `data/ayurveda_corpus_extended.json` covering Trade Marks Act 1999, Designs Act 2000, Copyright Act 1957, PPV&FR Act 2001, FSSAI Ayurveda-Aahar 2022, TRIPS, CBD, Nagoya Protocol, WIPO GRATK Treaty 2024, PCT, Madrid, Hague, and Budapest treaties.
2. **Vector Ingestion Pipeline (`backend/app/ingestion.py`)**:
   - Auto-scanned and chunked 25 legal documents, generating embeddings via `sentence-transformers` (`all-MiniLM-L6-v2`) stored in ChromaDB at `./backend/chroma_db`.
3. **`POST /api/query` Implementation**:
   - Embeds query and retrieves top-5 context chunks filtered by `jurisdiction` (`India` vs `International`).
   - Generates RAG answer citing specific statutory sections.
   - Outputs confidence level (`High`, `Medium`, `Low`) and dynamically populated `citations` array.
   - Activates `escalate_available: true` for low-confidence answers or high-stakes topics (ABS/biodiversity, NBA approvals, filing deadlines).
4. **`POST /api/classify` Implementation**:
   - Evaluates Ayurvedic product descriptions across 6 regulatory categories (`Classical Medicine`, `Patent or Proprietary Medicine`, `New Drug`, `Phytopharmaceutical`, `Ayurveda-Aahar`, `Cosmetic`).
   - Returns category name and confidence level.

### Verification Results
- Ran `scratch/test_endpoints.py` against FastAPI test server.
- All request/response schemas matched frontend API contract 100%.
- Out-of-domain queries successfully triggered low-confidence disclaimer responses with escalation options.
