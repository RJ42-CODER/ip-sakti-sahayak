# Architecture & Technical Decision Log — IP-SAKTI Sahayak

This document records key architectural and technology selection choices made during project development.

---

### Decision 001: Tech Stack & Free-Tier Tooling Selection
* **Date**: 2026-08-28
* **Context**: Smart India Hackathon 2026 requirement to build a production-capable MVP with strictly zero API cost constraints.
* **Choice**: FastAPI (Backend) + React/Vite (Frontend) + ChromaDB (Vector Store) + HuggingFace `sentence-transformers` + Gemini Free Tier / Groq + LangChain.
* **Rationale**:
  - **FastAPI**: Lightweight, asynchronous Python framework ideal for AI/ML pipelines and standard OpenAPI docs generation out-of-the-box.
  - **ChromaDB**: Chosen over FAISS because Chroma offers native metadata filtering (essential for strict jurisdiction separation: India-only vs International law) without needing manual SQLite or payload wrapper code. Runs 100% locally and free.
  - **HuggingFace `sentence-transformers`**: Runs embeddings locally with zero API dependency or cost.
  - **Gemini / Groq**: Provides fast inference within standard developer free tiers.
  - **Vite + React**: Rapid frontend prototyping with modern UI flexibility and fast HMR.

---

### Decision 002: Modular Corpus Ingestion & Embedding Architecture
* **Date**: 2026-08-30
* **Context**: The legal knowledge base spans both Indian national acts and international treaties, requiring extensible storage and metadata filtering.
* **Choice**:
  - Multi-file auto-pickup from `/data` (`*.json`).
  - Natural paragraph boundary chunking at max ~400 words per chunk.
  - Model: `all-MiniLM-L6-v2` via HuggingFace `sentence-transformers`.
  - Idempotent wipe-and-reload collection re-running strategy in local ChromaDB (`./backend/chroma_db`).
* **Rationale**:
  - Preserves 100% of original metadata (source_name, section, jurisdiction, law_type, source_url, last_verified) across all split chunks.
  - Ensures `jurisdiction` is filterable at the ChromaDB query layer to enforce non-blended jurisdiction toggle requirements.

---

### Decision 003: Real LLM Integration & Scenario Application Prompting
* **Date**: 2026-08-31
* **Context**: Audit revealed that previously `load_dotenv()` was not called prior to executing API requests, causing `call_llm()` to fail silently and fall back to returning raw retrieved text chunks without LLM scenario application.
* **Choice**:
  - Initialized `dotenv` loading explicitly (`load_dotenv(ENV_PATH)`) at the start of `backend/app/rag_engine.py`.
  - **Primary LLM**: Gemini API (`models/gemini-2.5-flash` / `models/gemini-3.6-flash`).
  - **Fallback LLM**: Groq API (`openai/gpt-oss-20b` / `qwen/qwen3.8-27b`).
  - **Scenario Application Prompt**: Redesigned LLM system prompt to explicitly instruct the model to identify the user's specific product/scenario (e.g., "Chawanprash") and apply the retrieved statutory rule to that scenario, rather than merely reciting general legal text.
* **Rationale**:
  - Delivers genuine, synthesized legal reasoning applied to user-provided product scenarios while maintaining zero API cost parameters and strict fallback safeguards.

---

### Decision 004: Strict Section-Level Citation Filtering & Readability Formatting
* **Date**: 2026-08-31
* **Context**: Audit revealed two issues:
  1. Broad Act-level matching in `is_doc_cited_in_answer()` previously included retrieved-but-unused sections in `citations` simply because they shared the same Act name.
  2. Dense formatting made legal answers harder to digest.
* **Choice**:
  - **Strict Section Matcher**: Updated `is_doc_cited_in_answer()` to require that a chunk's specific section or article identifier is explicitly mentioned in the generated answer text.
  - **Readability Prompt Guidelines**: Instructed the LLM to open with a bolded, standalone direct outcome sentence as the very first line (e.g. `**No, you cannot patent...**`), and to format explanations into short paragraphs (2-3 sentences max).
* **Rationale**:
  - Guarantees 100% precision in citation metadata matching—preventing false-positive citations.
  - Enhances UI readability for hackathon judges and Ayush regulatory users.

---

### Decision 005: Non-Agentic Closed-Context Groq Verification Auditor (`openai/gpt-oss-20b`)
* **Date**: 2026-08-31
* **Context**: Need to ensure consistent, deterministic verification auditor behavior that explicitly accepts valid product scenario application while strictly flagging unbacked legal assertions (e.g., GST exemptions).
* **Choice**:
  - **Model & Parameters**: Configured **`openai/gpt-oss-20b`** on Groq API with `temperature=0.0` for deterministic evaluation.
  - **Explicit Scenario Rule in System Prompt**: Added explicit verifier rule allowing scenario application while flagging unbacked penalties/tax claims.
* **Rationale**:
  - Guarantees deterministic, reproducible verification during live hackathon demonstrations.

---

### Decision 006: Verified Statutory URLs & Regulatory Link Separation
* **Date**: 2026-09-01
* **Context**: Updated all statutory entries across `ayurveda_corpus_base.json` and `ayurveda_corpus_extended.json` with manually verified IndiaCode & IPIndia official URLs.
* **Choice**:
  - **Primary Acts**: Mapped to official IndiaCode section portals (`https://indiacode.gov.in/act/...`) and IPIndia (`https://ipindia.gov.in/acts/patent-act-1970`).
  - **Subordinate Regulations**: Maintained `https://www.fssai.gov.in/` for FSSAI Ayurveda-Aahar Regulations, 2022 (as secondary regulation rather than primary Act).
* **Rationale**:
  - Ensures 100% official statutory link validity for judges and legal professionals evaluating citation links.
