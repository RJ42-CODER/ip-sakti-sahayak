import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.rag_engine import (
    QueryRequest,
    QueryResponse,
    ClassifyRequest,
    ClassifyResponse,
    TranslateUIRequest,
    TranslateUIResponse,
    process_query,
    process_classify,
    translate_ui_texts,
)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main_api")

app = FastAPI(
    title="IP-SAKTI Sahayak API",
    description="Multilingual RAG-based AI assistant for Ayurvedic IP & Regulatory Compliance (SIH26045)",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import threading

@app.on_event("startup")
def prewarm_cache():
    """
    Phase 10: Pre-warms embedding model and vector store into memory without blocking API workers.
    """
    def _background_prewarm():
        logger.info("Pre-warming vector DB & embedding model in background...")
        try:
            from app.rag_engine import get_resources
            get_resources()
            logger.info("Vector DB & embedding model pre-warmed successfully.")
        except Exception as e:
            logger.warning(f"Cache pre-warm warning: {e}")

    threading.Thread(target=_background_prewarm, daemon=True).start()

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
    # Phase 9: Input Validation
    q_stripped = (req.question or "").strip()
    if not q_stripped:
        raise HTTPException(status_code=400, detail="Question prompt cannot be empty.")
    if len(q_stripped) > 2000:
        raise HTTPException(status_code=400, detail="Question prompt exceeds maximum character limit of 2000.")
    if req.jurisdiction not in ["India", "International"]:
        raise HTTPException(status_code=400, detail="Invalid jurisdiction. Supported values: 'India', 'International'.")

    try:
        return process_query(req)
    except Exception as e:
        logger.error("Unhandled Exception in POST /api/query", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Query Processing Error. Please try again.")

@app.post("/api/classify", response_model=ClassifyResponse)
def classify_api(req: ClassifyRequest):
    desc_stripped = (req.description or "").strip()
    if not desc_stripped:
        raise HTTPException(status_code=400, detail="Product formulation description cannot be empty.")
    if len(desc_stripped) > 3000:
        raise HTTPException(status_code=400, detail="Product formulation description exceeds 3000 characters.")

    try:
        return process_classify(req)
    except Exception as e:
        logger.error("Unhandled Exception in POST /api/classify", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Classification Error. Please try again.")

@app.post("/api/translate_ui", response_model=TranslateUIResponse)
def translate_ui_api(req: TranslateUIRequest):
    try:
        return translate_ui_texts(req)
    except Exception as e:
        logger.error("Unhandled Exception in POST /api/translate_ui", exc_info=True)
        return TranslateUIResponse(translated_texts=req.texts)

