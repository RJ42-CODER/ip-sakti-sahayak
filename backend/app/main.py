from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.rag_engine import (
    QueryRequest,
    QueryResponse,
    ClassifyRequest,
    ClassifyResponse,
    process_query,
    process_classify,
)

app = FastAPI(
    title="IP-SAKTI Sahayak API",
    description="Multilingual RAG-based AI assistant for Ayurvedic IP & Regulatory Compliance (SIH26045)",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "IP-SAKTI Sahayak API",
        "version": "0.1.0"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "vector_store": "ChromaDB Persistent",
        "jurisdictions_supported": ["India", "International"]
    }

@app.post("/api/query", response_model=QueryResponse)
def query_api(req: QueryRequest):
    try:
        return process_query(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/classify", response_model=ClassifyResponse)
def classify_api(req: ClassifyRequest):
    try:
        return process_classify(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
