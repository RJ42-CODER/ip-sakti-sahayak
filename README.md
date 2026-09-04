# IP-SAKTI Sahayak

A multilingual, RAG-based AI assistant that answers Intellectual Property and 
regulatory questions about Ayurvedic products, with every answer grounded in 
and cited to real legal sources.

Built for Smart India Hackathon 2026 — Problem Statement SIH26045, 
Ministry of Ayush.

## Problem

Protecting and commercializing an Ayurvedic product requires navigating 
overlapping legal regimes at once: patents, geographical indications, 
trademarks, copyright, plant-variety rights, biodiversity access-and-benefit-
sharing obligations, and drug-regulatory classification. No authoritative, 
plain-language tool currently exists to guide practitioners, researchers, and 
AYUSH startups through this.

## What This Assistant Does

- Classifies a described Ayurvedic product into one of six regulatory 
  categories (classical medicine, patent-or-proprietary medicine, new drug, 
  phytopharmaceutical, Ayurveda-Aahar/nutraceutical, or cosmetic)
- Answers IP and regulatory questions with an explicit jurisdiction toggle, 
  keeping Indian law and international law strictly separate
- Cites the specific statute, section, or case relied on for every answer
- States a confidence level and abstains rather than guesses when the 
  underlying legal corpus does not cover a question
- Flags when a question should be escalated to a human IP facilitator

This is informational guidance only and does not constitute legal advice.

## Tech Stack

| Layer | Tool |
|---|---|
| Backend | FastAPI (Python) |
| Frontend | React (Vite) |
| Vector database | ChromaDB |
| Embeddings | HuggingFace sentence-transformers (all-MiniLM-L6-v2) |
| LLM | Gemini (free tier) / Groq |

All tools used are free-tier by design.

## Project Structure 
<img width="584" height="386" alt="image" src="https://github.com/user-attachments/assets/cadc7746-568d-4e3e-bd34-2b9c8a4bd3ec" />

## API Reference

### POST /api/query

Request:
```json
{
  "question": "string",
  "jurisdiction": "India" | "International"
}
```

Response:
```json
{
  "answer": "string",
  "confidence": "High" | "Medium" | "Low",
  "citations": [
    { "source_name": "string", "section": "string", "url": "string" }
  ],
  "disclaimer": "This is informational guidance, not legal advice.",
  "escalate_available": true
}
```

### POST /api/classify

Request:
```json
{
  "description": "string"
}
```

Response:
```json
{
  "category": "string",
  "confidence": "High" | "Medium" | "Low"
}
```

## Setup

### Run with Docker (Recommended)

Run the entire application (Backend + Frontend + Vector Store) with a single command:

```bash
docker-compose up --build
```

Access the applications:
- **Frontend SPA**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000` (Docs at `http://localhost:8000/docs`)

*Note: Ensure `backend/.env` is configured with your API key before launching containers.*

### Local Setup (Non-Docker)

#### Backend
```bash
cd backend
pip install -r requirements.txt 
cp .env.example .env 
uvicorn app.main:app --reload  
```

#### Frontend
```bash
cd frontend 
npm install 
cp .env.example .env 
npm run dev
```

## Documentation

See the `docs/` folder for the full codebase map, the reasoning behind each 
technical decision, and a chronological build log.

## Team

Smart India Hackathon 2026 — Ministry of Ayush, Problem Statement SIH26045
