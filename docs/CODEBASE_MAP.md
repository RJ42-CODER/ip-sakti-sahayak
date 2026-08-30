# Codebase Map — IP-SAKTI Sahayak (SIH26045)

## Tech Stack Summary
- **Backend**: FastAPI (Python)
- **Frontend**: React (Vite)
- **Vector DB**: ChromaDB (self-hosted local persistence at `./backend/chroma_db`)
- **Embeddings**: HuggingFace `sentence-transformers` (`all-MiniLM-L6-v2`)
- **LLM**: Gemini API (Free Tier) / Groq API (Free Tier)
- **Orchestration**: LangChain

---

## Directory Structure

```
ip-sakti-sahayak/
├── backend/                  # FastAPI python backend
│   ├── app/                  # Application code
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI entrypoint & endpoint routing
│   │   ├── ingestion.py      # Vector DB ingestion & chunking pipeline
│   │   └── rag_engine.py     # RAG retrieval, query synthesis & product classification engine
│   ├── chroma_db/            # Local persistent ChromaDB vector store
│   ├── .env.example          # Environment variables template
│   └── requirements.txt      # Python dependencies
├── data/                     # Verified legal corpus JSON files
│   ├── ayurveda_corpus_base.json      # 12 base verified legal entries
│   └── ayurveda_corpus_extended.json  # 13 extended national & international legal entries
├── frontend/                 # React (Vite) web application
│   ├── public/               # Static assets
│   ├── src/                  # React source files
│   │   ├── App.jsx           # Main UI component
│   │   ├── main.jsx          # Entrypoint
│   │   └── index.css         # Global styles
│   ├── package.json          # Node dependencies & scripts
│   ├── vite.config.js        # Vite configuration
│   └── .env.example          # Frontend environment configuration
├── scratch/                  # Test scripts & verification suites
│   └── test_endpoints.py     # Endpoint contract verification script
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
| `POST` | `/api/query` | RAG legal QA with jurisdiction filtering & source citations | Implemented |
| `POST` | `/api/classify` | Ayurvedic product regulatory category classification | Implemented |
