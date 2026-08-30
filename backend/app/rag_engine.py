import os
import re
import json
import logging
from pathlib import Path
from typing import Literal
from pydantic import BaseModel, Field
import chromadb
from sentence_transformers import SentenceTransformer

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rag_engine")

# Directory paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
CHROMA_PERSIST_DIR = BASE_DIR / "backend" / "chroma_db"
COLLECTION_NAME = "ayurveda_legal_kb"
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"

# Global lazy singletons
_chroma_client = None
_collection = None
_embedding_model = None

def get_resources():
    global _chroma_client, _collection, _embedding_model
    if _embedding_model is None:
        logger.info(f"Loading embedding model: {EMBEDDING_MODEL_NAME}")
        _embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
        
    if _chroma_client is None:
        logger.info(f"Connecting to ChromaDB at: {CHROMA_PERSIST_DIR}")
        _chroma_client = chromadb.PersistentClient(path=str(CHROMA_PERSIST_DIR))
        _collection = _chroma_client.get_collection(name=COLLECTION_NAME)
        
    return _embedding_model, _collection

# Pydantic Schemas matching exact frontend API contract

class QueryRequest(BaseModel):
    question: str = Field(..., example="Can I patent a classical Ayurvedic formulation in India?")
    jurisdiction: Literal["India", "International"] = Field(..., example="India")

class Citation(BaseModel):
    source_name: str
    section: str
    url: str

class QueryResponse(BaseModel):
    answer: str
    confidence: Literal["High", "Medium", "Low"]
    citations: list[Citation]
    disclaimer: str = "This is informational guidance, not legal advice."
    escalate_available: bool

class ClassifyRequest(BaseModel):
    description: str = Field(..., example="A herbal hair oil made of Amla and Bhringraj processed using coconut oil as per Sharangdhara Samhita.")

class ClassifyResponse(BaseModel):
    category: str
    confidence: Literal["High", "Medium", "Low"]

# LLM Helper function
def call_llm(prompt: str, system_instruction: str = "") -> str:
    """
    Calls Gemini API if GEMINI_API_KEY is available, or Groq API if GROQ_API_KEY is available.
    Returns empty string if no API key or call fails.
    """
    gemini_key = os.getenv("GEMINI_API_KEY")
    groq_key = os.getenv("GROQ_API_KEY")

    if gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=system_instruction if system_instruction else None
            )
            response = model.generate_content(prompt)
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            logger.warning(f"Gemini API call failed: {e}")

    if groq_key:
        try:
            from langchain_community.chat_models import ChatGroq
            chat = ChatGroq(groq_api_key=groq_key, model_name="llama3-8b-8192")
            res = chat.invoke(f"{system_instruction}\n\n{prompt}")
            if res and res.content:
                return str(res.content).strip()
        except Exception as e:
            logger.warning(f"Groq API call failed: {e}")

    return ""

def synthesize_rag_fallback(question: str, jurisdiction: str, retrieved_docs: list[dict]) -> tuple[str, dict]:
    """
    Smart deterministic fallback synthesis if external LLM API keys are not provided.
    Returns (answer_text, primary_used_doc).
    """
    if not retrieved_docs:
        return "I don't have enough information to answer this confidently.", {}
    
    q_lower = question.lower()
    q_words = set(re.findall(r"\w+", q_lower)) - {"a", "an", "the", "in", "on", "can", "i", "what", "is", "do", "does", "of", "for", "to", "like"}
    
    # Keyword-guided reranking for fallback selection among top retrieved docs
    best_doc = retrieved_docs[0]
    best_score = -1.0
    
    for doc in retrieved_docs:
        text_lower = doc["text"].lower()
        meta = doc["metadata"]
        
        # Count overlapping keywords
        match_count = sum(1 for w in q_words if w in text_lower or w in meta.get("law_type", "").lower() or w in meta.get("source_name", "").lower())
        
        # Penalize distance
        dist_penalty = doc.get("distance", 1.0)
        score = match_count - (dist_penalty * 2.0)
        
        if score > best_score:
            best_score = score
            best_doc = doc
            
    # Check if retrieval quality is too low
    if best_doc.get("distance", 1.0) > 0.60 or best_score < -1.5:
        return "I don't have enough information to answer this confidently.", {}
        
    meta = best_doc["metadata"]
    text = best_doc["text"]
    return f"According to {meta.get('source_name')} ({meta.get('section')}): {text}", best_doc

def process_query(req: QueryRequest) -> QueryResponse:
    embedder, collection = get_resources()
    
    # 1. Embed question
    q_emb = embedder.encode(req.question).tolist()
    
    # 2. Query ChromaDB filtered strictly by jurisdiction
    results = collection.query(
        query_embeddings=[q_emb],
        n_results=5,
        where={"jurisdiction": req.jurisdiction}
    )
    
    docs = results.get("documents", [[]])[0]
    metas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0] if "distances" in results else [0.0]*len(docs)
    
    retrieved = []
    for d, m, dist in zip(docs, metas, distances):
        retrieved.append({"text": d, "metadata": m, "distance": dist})
        
    # Check top similarity distance
    top_dist = retrieved[0]["distance"] if retrieved else 1.0
    
    # Check out of domain query (e.g. quantum computing, unrelated domain)
    q_words = set(re.findall(r"\w+", req.question.lower()))
    domain_terms = {"patent", "patents", "trademark", "copyright", "design", "gi", "geographical", "ayurveda", "medicine", "drug", "nba", "biodiversity", "fssai", "trips", "cbd", "nagoya", "pct", "madrid", "hague", "budapest", "wipo", "tkdl", "turmeric", "neem", "plant", "farmers", "aahar", "formulation", "herb", "herbal"}
    
    has_domain_term = bool(q_words & domain_terms)
    
    if not has_domain_term and top_dist > 0.50:
        return QueryResponse(
            answer="I don't have enough information to answer this confidently.",
            confidence="Low",
            citations=[],
            disclaimer="This is informational guidance, not legal advice.",
            escalate_available=True
        )

    # 3. Construct prompt & call LLM
    context_str = "\n\n".join([
        f"--- Source: {r['metadata'].get('source_name')} ({r['metadata'].get('section')}) ---\n{r['text']}"
        for r in retrieved
    ])
    
    system_instruction = (
        "You are IP-SAKTI Sahayak, an AI legal assistant for the Ministry of Ayush. "
        "Answer the user's question accurately using ONLY the provided legal context. "
        "Do not use outside knowledge. Cite the specific Act and Section numbers in your answer. "
        "If the provided context does not contain sufficient information to answer the question confidently, "
        "you MUST reply strictly with: 'I don't have enough information to answer this confidently.'"
    )
    
    prompt = f"Jurisdiction: {req.jurisdiction}\nQuestion: {req.question}\n\nRetrieved Legal Context:\n{context_str}"
    
    llm_output = call_llm(prompt, system_instruction)
    primary_doc = None
    
    if not llm_output:
        # Fallback RAG synthesis
        llm_output, primary_doc = synthesize_rag_fallback(req.question, req.jurisdiction, retrieved)
        
    # 4. Process Answer & Citations
    is_uncertain = "don't have enough information" in llm_output.lower()
    
    citations = []
    if not is_uncertain:
        seen_keys = set()
        
        # If fallback identified a primary doc, list it first
        docs_to_scan = [primary_doc] + retrieved if primary_doc else retrieved
        
        for r in docs_to_scan:
            if not r or "metadata" not in r:
                continue
            m = r["metadata"]
            s_name = m.get("source_name", "")
            sec = m.get("section", "")
            u = m.get("source_url", "")
            
            key = (s_name, sec, u)
            if key not in seen_keys and s_name:
                # Only include citations whose section or Act is actually referenced in answer or context
                if (s_name.lower() in llm_output.lower() or sec.lower() in llm_output.lower() or primary_doc == r):
                    seen_keys.add(key)
                    citations.append(Citation(
                        source_name=s_name,
                        section=sec,
                        url=u
                    ))
                    
        # If citations empty, populate top match as fallback
        if not citations and retrieved:
            m = retrieved[0]["metadata"]
            citations.append(Citation(
                source_name=m.get("source_name", ""),
                section=m.get("section", ""),
                url=m.get("source_url", "")
            ))
    
    # 5. Determine Confidence
    if is_uncertain or top_dist > 0.58:
        confidence = "Low"
    elif top_dist < 0.42:
        confidence = "High"
    else:
        confidence = "Medium"
        
    # 6. Determine Escalate Available
    q_lower = req.question.lower()
    high_stakes_keywords = [
        "abs", "biodiversity", "nba", "national biodiversity authority",
        "benefit sharing", "nagoya", "cbd", "filing", "deadline",
        "application", "opposition", "revocation", "penalty", "court"
    ]
    
    is_high_stakes = any(kw in q_lower for kw in high_stakes_keywords)
    escalate = (confidence == "Low") or is_high_stakes

    return QueryResponse(
        answer=llm_output,
        confidence=confidence,
        citations=citations[:3],
        disclaimer="This is informational guidance, not legal advice.",
        escalate_available=escalate
    )

def process_classify(req: ClassifyRequest) -> ClassifyResponse:
    desc = req.description.lower()
    
    system_instruction = (
        "You are an expert Ayurvedic Regulatory Classifier for the Ministry of Ayush. "
        "Classify the Ayurvedic product description into EXACTLY ONE of these 6 categories:\n"
        "1. Classical Medicine\n"
        "2. Patent or Proprietary Medicine\n"
        "3. New Drug / Non-Classical Drug\n"
        "4. Phytopharmaceutical\n"
        "5. Ayurveda-Aahar / Nutraceutical\n"
        "6. Cosmetic\n\n"
        "Respond ONLY with a JSON object in this format: {\"category\": \"<Category Name>\", \"confidence\": \"High\" | \"Medium\" | \"Low\"}"
    )
    
    prompt = f"Product Description: {req.description}"
    llm_output = call_llm(prompt, system_instruction)
    
    if llm_output:
        try:
            json_match = re.search(r"\{.*\}", llm_output, re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group(0))
                return ClassifyResponse(
                    category=parsed.get("category", "Patent or Proprietary Medicine"),
                    confidence=parsed.get("confidence", "Medium")
                )
        except Exception as e:
            logger.warning(f"Failed to parse LLM JSON classification: {e}")
            
    # Deterministic Classifier Fallback based on PS criteria
    if any(k in desc for k in ["sharangdhara", "charaka", "sushruta", "bhasma", "churna", "asava", "arishta", "authoritative text", "first schedule"]):
        category = "Classical Medicine"
        conf = "High"
    elif any(k in desc for k in ["food", "supplement", "diet", "aahar", "fssai", "drink", "tea", "nutrition"]):
        category = "Ayurveda-Aahar / Nutraceutical"
        conf = "High"
    elif any(k in desc for k in ["cream", "lotion", "hair oil", "shampoo", "face wash", "skin", "cosmetic", "external application"]):
        category = "Cosmetic"
        conf = "High"
    elif any(k in desc for k in ["purified fraction", "standardized extract", "marker compound", "phytopharmaceutical"]):
        category = "Phytopharmaceutical"
        conf = "High"
    elif any(k in desc for k in ["synthetic", "novel compound", "chemical modification", "clinical trial"]):
        category = "New Drug / Non-Classical Drug"
        conf = "Medium"
    else:
        category = "Patent or Proprietary Medicine"
        conf = "Medium"
        
    return ClassifyResponse(
        category=category,
        confidence=conf
    )
