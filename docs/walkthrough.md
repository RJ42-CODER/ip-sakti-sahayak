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

---

## 2026-09-02: Scope-Setting Info Card Added to Query Engine

### Work Completed
1. **Added Scope Guidance UI Panel**:
   - Added a subtle `.scope-info-card` element above the query input in [`frontend/src/App.jsx`](file:///C:/Users/Soham/.gemini/antigravity/scratch/ip-sakti-sahayak/frontend/src/App.jsx) and styled in [`frontend/src/index.css`](file:///C:/Users/Soham/.gemini/antigravity/scratch/ip-sakti-sahayak/frontend/src/index.css).
   - Text: *"This assistant can help with: Patent eligibility of Ayurvedic formulations, Geographical Indication & Trademark protection, Biodiversity/ABS compliance for medicinal plants, Drug vs. cosmetic vs. nutraceutical classification, and landmark case precedents (e.g. Neem, Turmeric). Questions outside Indian/international IP and AYUSH regulatory law will be declined."*
   - Styled with a subtle off-white background, soft border, and discrete left accent bar matching the primary navy theme so it does not compete visually with the main input.
2. **Build Verification**:
   - Built cleanly via `npm run build` in 13.6s with 0 errors.

---

## 2026-09-03: Post-Verification Multilingual Support (`target_language` & `translated_answer`)

### Work Completed
1. **Backend Schema & Architecture**:
   - Extended `QueryRequest` with optional `target_language: str | None = None`.
   - Extended `QueryResponse` with optional `translated_answer: str | None = None`.
   - Implemented `translate_answer()` using Gemini (`models/gemini-2.5-flash`), strictly executed **AFTER** generation, citation filtering, and independent Groq verification.
   - Enforced rule preserving Act names (e.g. *Patents Act, 1970*, *Drugs and Cosmetics Act, 1940*), section numbers (*Section 3(p)*, *Section 3(a)*), and citation fields in original English.
   - Appended mandatory disclaimer note: `"*Note: This translation is provided for convenience. The English version above is authoritative in case of any discrepancy.*"`.
   - Built graceful failure fallback: translation errors fail silently to `translated_answer = null` without blocking the verified English answer.
2. **Frontend UI Integration**:
   - Added regional language selector dropdown (`form-select`) supporting Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati, Kannada, Malayalam.
   - Added translated answer presentation section (`translated-answer-box`) styled in warm legal amber (`border-left: 3px solid #f59e0b`).
   - Verified production build via `npm run build` (built cleanly in 16.35s).
3. **Live Verification**:
   - Executed `scratch/test_hindi_translation.py` for the Chawanprash query with `target_language: "Hindi"`.
   - Confirmed both `answer` (English authoritative) and `translated_answer` (Hindi prose with un-translated Act/Section identifiers) returned with `Status 200`.

---

## 2026-09-04: System Hardening, Speed Optimization & UI Polish

### Work Completed
1. **Removed False Bhashini Branding (Task 1)**:
   - Replaced all user-facing Bhashini text in `frontend/src/App.jsx`:
     - Header pill: changed to `Multilingual Support`.
     - Voice button label: changed from `🎙 Speak with Bhashini` to `🎙 Voice Input`.
     - Button title: changed to `Voice speech-to-text input powered by Web Speech API`.
     - Error alert and internal comments: clarified usage of native browser Web Speech API.
2. **Response Speed Optimization & Token Capping (Task 2)**:
   - Capped LLM answer generation with `max_output_tokens=400` in Gemini `GenerationConfig` and `max_tokens=400` in Groq API fallback.
   - Updated system prompt to explicitly request a concise 2-4 sentence core legal answer.
   - Confirmed `translate_answer()` only triggers when `target_language` is explicitly provided and non-English (default requests execute zero translation calls).
   - Measured benchmark:
     - **Before**: 16.28s response time, 997 characters (138 words).
     - **After**: 10.21s response time, 617 characters (89 words).
     - **Improvement**: ~37% faster end-to-end turnaround and 38% more concise output.
3. **Restored Scope Panel (Task 3)**:
   - Restored `.scope-info-card` above the query input in `frontend/src/App.jsx` with the exact requested text:
     *"This assistant can help with: Patent eligibility of Ayurvedic formulations, Geographical Indication & Trademark protection, Biodiversity/ABS compliance for medicinal plants, Drug vs. cosmetic vs. nutraceutical classification, and landmark case precedents (e.g. Neem, Turmeric). Questions outside Indian/international IP and AYUSH regulatory law will be declined."*
   - Styled with subtle frosted slate theme in `frontend/src/index.css`.
4. **Distinguished Out-of-Scope vs. Weak-Context (Task 4)**:
   - Updated domain relevance pre-check failure message in `backend/app/rag_engine.py`:
     *"This question is outside my area — I'm built specifically for Ayurvedic IP and regulatory law questions."*
   - Preserved *"I don't have enough information to answer this confidently."* for weak in-domain context.
5. **Fixed CORS (Task 5)**:
   - Changed FastAPI CORS `allow_origins` in `backend/app/main.py` from `["*"]` to explicit `["http://localhost:3000", "http://localhost:5173"]`.
---

## 2026-09-04: Progressive Disclosure & Diagrammatic Scope Panel UI

### Work Completed
1. **Progressive Disclosure for Answers**:
   - Implemented `splitAnswer` in [`frontend/src/App.jsx`](file:///C:/Users/Soham/.gemini/antigravity/scratch/ip-sakti-sahayak/frontend/src/App.jsx) to split legal answers on `\n\n`.
   - The bolded first-line takeaway is rendered as an immediate summary.
   - The full explanation paragraphs are contained inside a smooth expandable container (`.explanation-content`), toggled via a *"Show full explanation / Hide full explanation"* button with `ChevronDown`/`ChevronUp` icons.
   - Styled transition and toggle button in [`frontend/src/index.css`](file:///C:/Users/Soham/.gemini/antigravity/scratch/ip-sakti-sahayak/frontend/src/index.css).
   - Added automatic reset of `showFullExplanation` on new query submissions or quick prompt selections.
2. **Diagrammatic Scope Panel Layout**:
   - Replaced paragraph `.scope-info-card` in `App.jsx` with a 5-card grid (`.scope-grid`):
     - **Scale**: Patent Eligibility
     - **Award**: GI & Trademark Protection
     - **Leaf**: Biodiversity/ABS Compliance
     - **Tag**: Product Classification
     - **BookOpen**: Case Precedents
   - Preserved out-of-scope decline note as a subtle caption below the card grid.
---

## 2026-09-04: Full Stack Docker Containerization & Orchestration

### Work Completed
1. **Backend Dockerfile** ([backend/Dockerfile](file:///C:/Users/Soham/.gemini/antigravity/scratch/ip-sakti-sahayak/backend/Dockerfile)):
   - Base image `python:3.11-slim`.
   - Multi-layer caching: `COPY requirements.txt` and `pip install` before copying application code.
   - Set working directory to `/app` with `PYTHONPATH=/app`.
   - Exposes port 8000 and executes `uvicorn backend.app.main:app --host 0.0.0.0 --port 8000`.
2. **Frontend Docker Infrastructure**:
   - **Nginx Configuration** ([frontend/nginx.conf](file:///C:/Users/Soham/.gemini/antigravity/scratch/ip-sakti-sahayak/frontend/nginx.conf)): Minimal Nginx configuration listening on port 80, serving SPA static files from `/usr/share/nginx/html` with fallback routing (`try_files $uri $uri/ /index.html;`), and proxying `/api/` requests to `http://backend:8000/api/`.
   - **Multi-Stage Dockerfile** ([frontend/Dockerfile](file:///C:/Users/Soham/.gemini/antigravity/scratch/ip-sakti-sahayak/frontend/Dockerfile)): Stage 1 uses `node:20-alpine` (`npm install` & `npm run build`), Stage 2 uses `nginx:alpine` serving production static distribution.
3. **Docker Compose Specification** ([docker-compose.yml](file:///C:/Users/Soham/.gemini/antigravity/scratch/ip-sakti-sahayak/docker-compose.yml)):
   - Orchestrates `backend` and `frontend` services.
   - Backend reads environment variables from `./backend/.env` via `env_file`.
   - Mounts persistent ChromaDB volume `./backend/chroma_db:/app/backend/chroma_db`.
   - Maps host ports `8000:8000` (Backend API) and `3000:80` (Frontend Nginx SPA).
   - Validated configuration via `docker-compose config`.
---

## 2026-09-07: Corpus Freshness Maintenance Script

### Work Completed
1. Created standalone maintenance script [`backend/scripts/check_freshness.py`](file:///C:/Users/Soham/.gemini/antigravity/scratch/ip-sakti-sahayak/backend/scripts/check_freshness.py) to track statutory source website drift.
2. Extracts visible prose text via BeautifulSoup, collapses whitespace, computes SHA256 hashes, and manages a 2-run debounced state file in [`data/corpus_freshness_state.json`](file:///C:/Users/Soham/.gemini/antigravity/scratch/ip-sakti-sahayak/data/corpus_freshness_state.json).
3. Verified via 3 consecutive test executions.



