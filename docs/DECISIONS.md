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

### Decision 003: End-to-End Query RAG & Product Classification Pipeline
* **Date**: 2026-08-30
* **Context**: Building `POST /api/query` and `POST /api/classify` while strictly adhering to frontend JSON schemas and zero-cost API fallback requirements.
* **Choice**:
  - `POST /api/query`: Retrieves top-5 chunks filtered by `jurisdiction` metadata from ChromaDB. Constructs RAG prompt for Gemini/Groq LLMs, with a smart deterministic RAG synthesis fallback when external LLM API keys are unconfigured or offline.
  - Citation Mapping: Dynamically compiles `citations` array using `source_name`, `section`, and `source_url` -> `url` matching cited context.
  - Escalation Triggering: Sets `escalate_available: true` whenever confidence is `"Low"`, or when high-stakes topics (ABS/biodiversity, NBA approvals, filing deadlines, patent oppositions) are detected.
  - `POST /api/classify`: Categorizes Ayurvedic product descriptions into one of 6 regulatory categories (`Classical Medicine`, `Patent or Proprietary Medicine`, `New Drug / Non-Classical Drug`, `Phytopharmaceutical`, `Ayurveda-Aahar / Nutraceutical`, `Cosmetic`) with confidence estimation.
* **Rationale**:
  - Ensures 100% adherence to the mock frontend API contract without field renaming.
  - Guarantees system operates seamlessly both online with LLM keys and offline with deterministic fallback.
