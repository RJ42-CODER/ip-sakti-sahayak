# Codebase Map — IP-SAKTI Sahayak (SIH26045)

## Tech Stack Summary
- **Backend**: FastAPI (Python)
- **Frontend**: React 18 (Vite) + Lucide React + React Markdown
- **Vector DB**: ChromaDB (self-hosted local persistence at `./backend/chroma_db`)
- **Embeddings**: HuggingFace `sentence-transformers` (`all-MiniLM-L6-v2`)
- **Primary LLM**: Gemini API (`models/gemini-2.5-flash`)
- **Independent Verifier LLM**: Groq API (`openai/gpt-oss-20b` / `qwen/qwen3.8-27b`, temperature=0.0)

---

## Directory Structure

```
ip-sakti-sahayak/
├── backend/                  # FastAPI python backend
│   ├── app/                  # Application code
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI entrypoint & endpoint routing
│   │   ├── ingestion.py      # Vector DB ingestion & chunking pipeline
│   │   └── rag_engine.py     # RAG retrieval, query synthesis, verification auditor & classification engine
│   ├── chroma_db/            # Local persistent ChromaDB vector store
│   ├── .env.example          # Environment variables template
│   └── requirements.txt      # Python dependencies
├── data/                     # Verified legal corpus JSON files
│   ├── ayurveda_corpus_base.json      # 12 base verified legal entries
│   └── ayurveda_corpus_extended.json  # 13 extended national & international legal entries
├── frontend/                 # React (Vite) web application
│   ├── public/               # Static assets
│   ├── src/                  # React source files
│   │   ├── App.jsx           # Main Portal UI component (Query Engine, Classification, Verification & Escalation Modal)
│   │   ├── main.jsx          # Entrypoint
│   │   └── index.css         # Government-tech / SaaS Portal stylesheet
│   ├── package.json          # Node dependencies & scripts
│   ├── vite.config.js        # Vite configuration with /api proxy to localhost:8000
│   └── .env.example          # Frontend environment configuration
├── scratch/                  # Test scripts & verification suites
│   ├── test_endpoints.py     # Endpoint contract verification script
│   ├── test_user_cases.py    # Case study query execution script
│   ├── test_chawanprash.py   # Chawanprash patentability query test
│   ├── test_verifier.py      # Verification auditor test suite
│   ├── test_subtle_overreach.py # Subtle claim audit script
│   └── test_repeat_verifier.py  # Repeatability test script
└── docs/                     # Project documentation
    ├── CODEBASE_MAP.md       # Directory structure, endpoints, stack map
    ├── DECISIONS.md          # Log of technical choices & architecture rationale
    └── walkthrough.md        # Work log and progress record
```

---

## API Endpoints List

| Method | Endpoint | Description | Status |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Health check endpoint | Implemented |
| `GET` | `/api/health` | Service status & database check | Implemented |
| `POST` | `/api/query` | RAG legal QA with jurisdiction filtering, citation matching & verification auditing | Implemented |
| `POST` | `/api/classify` | Ayurvedic product regulatory category classification | Implemented |
