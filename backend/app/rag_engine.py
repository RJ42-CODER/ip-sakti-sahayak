import os
import re
import json
import logging
import httpx
from pathlib import Path
from typing import Literal
from dotenv import load_dotenv
from pydantic import BaseModel, Field
import chromadb
from sentence_transformers import SentenceTransformer

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rag_engine")

# Directory paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
CHROMA_PERSIST_DIR = BASE_DIR / "backend" / "chroma_db"
ENV_PATH = BASE_DIR / "backend" / ".env"
COLLECTION_NAME = "ayurveda_legal_kb"
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"

# Load environment variables from backend/.env and system environment
load_dotenv(ENV_PATH)
load_dotenv()

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
    target_language: str | None = Field(default=None, example="Hindi")

class Citation(BaseModel):
    source_name: str
    section: str
    url: str

class QueryResponse(BaseModel):
    answer: str
    translated_answer: str | None = None
    confidence: Literal["High", "Medium", "Low"]
    citations: list[Citation]
    disclaimer: str = "This is informational guidance, not legal advice."
    escalate_available: bool

class ClassifyRequest(BaseModel):
    description: str = Field(..., example="A herbal hair oil made of Amla and Bhringraj processed using coconut oil as per Sharangdhara Samhita.")

class ClassifyResponse(BaseModel):
    category: str
    confidence: Literal["High", "Medium", "Low"]

# LLM Integration: Primary Gemini API, Fallback Groq API

def call_llm(prompt: str, system_instruction: str = "", max_output_tokens: int = 400) -> str:
    """
    Primary: Gemini API (gemini-2.5-flash / gemini-3.6-flash).
    Fallback: Groq API (openai/gpt-oss-20b / qwen/qwen3.8-27b).
    Returns empty string if both fail or keys are absent.
    max_output_tokens caps length to force concise, fast response.
    """
    gemini_key = os.getenv("GEMINI_API_KEY")
    groq_key = os.getenv("GROQ_API_KEY")

    # 1. Primary: Gemini API
    if gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            
            for model_name in ["models/gemini-3.1-flash-lite", "models/gemini-2.5-flash", "models/gemini-3.6-flash", "models/gemini-3.5-flash-lite", "models/gemini-flash-latest"]:
                try:
                    model = genai.GenerativeModel(
                        model_name=model_name,
                        system_instruction=system_instruction if system_instruction else None,
                        generation_config=genai.GenerationConfig(
                            max_output_tokens=max_output_tokens,
                            temperature=0.2
                        )
                    )
                    response = model.generate_content(prompt)
                    if response and response.text:
                        logger.info(f"Gemini API generation succeeded with model '{model_name}'.")
                        return response.text.strip()
                except Exception as m_err:
                    logger.warning(f"Gemini model '{model_name}' failed: {m_err}")
        except Exception as e:
            logger.warning(f"Gemini API primary call failed: {e}")

    # 2. Fallback: Groq API (Non-agentic models)
    if groq_key:
        logger.info("Attempting Groq API fallback...")
        try:
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"}
            messages = []
            if system_instruction:
                messages.append({"role": "system", "content": system_instruction})
            messages.append({"role": "user", "content": prompt})
            
            for model_name in ["openai/gpt-oss-20b", "qwen/qwen3.8-27b"]:
                payload = {
                    "model": model_name,
                    "messages": messages,
                    "temperature": 0.0,
                    "max_tokens": max_output_tokens
                }
                res = httpx.post(url, headers=headers, json=payload, timeout=12.0)
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    if content:
                        logger.info(f"Groq API fallback succeeded with model '{model_name}'.")
                        return content.strip()
        except Exception as e:
            logger.warning(f"Groq API fallback call failed: {e}")

    return ""

def translate_answer(verified_english_answer: str, target_language: str) -> str | None:
    """
    Translates ONLY the prose explanation of the verified English answer into target_language.
    Preserves Act names, section/article numbers, and proper legal identifiers in original English.
    Appends fixed disclaimer note.
    Returns None on failure.
    """
    if not verified_english_answer or not target_language:
        return None
    
    tl_clean = target_language.strip()
    if tl_clean.lower() in ["english", "en"]:
        return None

    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        logger.warning("No GEMINI_API_KEY available for translation.")
        return None

    fixed_note = "\n\n*Note: This translation is provided for convenience. The English version above is authoritative in case of any discrepancy.*"

    system_instruction = (
        f"You are an expert legal translator for the Ministry of Ayush.\n"
        f"Translate the provided verified legal answer into {tl_clean}.\n\n"
        "STRICT TRANSLATION RULES:\n"
        f"1. Translate ONLY the explanatory prose into natural, professional, grammatically accurate {tl_clean}.\n"
        "2. DO NOT translate: Act names (e.g. 'Patents Act, 1970', 'Drugs and Cosmetics Act, 1940', 'Biological Diversity Act, 2002'), section/article numbers (e.g. 'Section 3(p)', 'Section 3(a)', 'Article 27'), or statutory citations — keep them in their original English form.\n"
        "3. Preserve markdown formatting, bold text markers, lists, and line breaks exactly.\n"
        "4. Output ONLY the translated text without conversational preamble or meta-commentary."
    )

    prompt = f"English Legal Answer to Translate:\n{verified_english_answer}"

    try:
        import google.generativeai as genai
        genai.configure(api_key=gemini_key)
        
        for model_name in ["models/gemini-2.5-flash", "models/gemini-3.6-flash", "models/gemini-flash-latest"]:
            try:
                model = genai.GenerativeModel(
                    model_name=model_name,
                    system_instruction=system_instruction
                )
                response = model.generate_content(prompt)
                if response and response.text:
                    translated_text = response.text.strip()
                    logger.info(f"Translation to {tl_clean} succeeded with Gemini model '{model_name}'.")
                    return translated_text + fixed_note
            except Exception as m_err:
                logger.warning(f"Gemini translation model '{model_name}' failed: {m_err}")
    except Exception as e:
        logger.warning(f"Translation call failed: {e}")

    return None

def verify_answer(draft_answer: str, cited_chunks: list[dict]) -> dict:
    """
    Independent Verification Step using a PURE CLOSED-CONTEXT non-agentic Groq model (openai/gpt-oss-20b).
    Checks whether discrete factual or legal claims in draft_answer are strictly backed by cited_chunks text.
    """
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key or not cited_chunks or not draft_answer or "don't have enough information" in draft_answer.lower():
        return {"all_claims_supported": True, "unsupported_claims": []}

    chunks_text = "\n\n".join([
        f"--- Cited Source: {(c.get('metadata') or {}).get('source_name', '')} ({(c.get('metadata') or {}).get('section', '')}) ---\n{c.get('text', '')}"
        for c in cited_chunks if c
    ])

    system_instruction = (
        "You are an independent Legal Verification Auditor for the Ministry of Ayush.\n"
        "Your task is to strictly audit a draft AI legal answer against ONLY the provided cited legal source texts.\n\n"
        "CLOSED-CONTEXT AUDIT RULES:\n"
        "1. Applying a general rule or definition from the source text to the specific product/scenario named in the user's question is VALID and should be marked supported, even though the source text doesn't name that product specifically.\n"
        "2. Only flag a claim as unsupported if it asserts something the source text does not establish even in general/abstract terms — e.g. a specific penalty, tax status (such as GST exemption), criminal fine, or legal consequence never mentioned in the source text at all.\n"
        "3. Do NOT use outside knowledge or tools. Evaluate STRICTLY against the provided text.\n"
        "4. Respond ONLY with a JSON object in this format:\n"
        "{\n"
        '  "all_claims_supported": true | false,\n'
        '  "unsupported_claims": ["list of specific unbacked or injected claims, if any"]\n'
        "}"
    )

    prompt = f"Draft Answer to Audit:\n{draft_answer}\n\nProvided Source Texts:\n{chunks_text}"

    for verifier_model in ["openai/gpt-oss-20b", "qwen/qwen3.8-27b"]:
        try:
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"}
            messages = [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": prompt}
            ]
            payload = {
                "model": verifier_model,
                "messages": messages,
                "temperature": 0.0,
                "response_format": {"type": "json_object"}
            }
            res = httpx.post(url, headers=headers, json=payload, timeout=8.0)
            if res.status_code == 200:
                content = res.json()["choices"][0]["message"]["content"]
                parsed = json.loads(content)
                logger.info(f"Verification auditor ({verifier_model}) completed: all_claims_supported={parsed.get('all_claims_supported')}")
                return parsed
        except Exception as e:
            logger.warning(f"Groq verification step with model '{verifier_model}' failed: {e}")

    # Fallback to Gemini if Groq API fails or rate limits
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel(
                model_name="models/gemini-2.5-flash",
                system_instruction=system_instruction
            )
            res = model.generate_content(prompt)
            json_match = re.search(r"\{.*\}", res.text, re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group(0))
                return parsed
        except Exception as e:
            logger.warning(f"Gemini verifier fallback failed: {e}")

    return {"all_claims_supported": True, "unsupported_claims": []}

def synthesize_rag_fallback(question: str, jurisdiction: str, retrieved_docs: list[dict]) -> tuple[str, dict]:
    """
    Smart deterministic fallback synthesis if external LLM APIs fail or rate limit.
    Returns (answer_text, primary_used_doc).
    """
    if not retrieved_docs:
        return "I don't have enough information to answer this confidently.", {}
    
    q_lower = question.lower()
    q_words = set(re.findall(r"\w+", q_lower)) - {"a", "an", "the", "in", "on", "can", "i", "what", "is", "do", "does", "of", "for", "to", "like"}
    
    best_doc = retrieved_docs[0]
    best_score = -1.0
    
    for doc in retrieved_docs:
        text_lower = (doc.get("text") or "").lower()
        meta = doc.get("metadata") or {}
        match_count = sum(1 for w in q_words if w in text_lower or w in (meta.get("law_type") or "").lower() or w in (meta.get("source_name") or "").lower())
        dist_penalty = doc.get("distance", 1.0)
        score = match_count - (dist_penalty * 2.0)
        
        if score > best_score:
            best_score = score
            best_doc = doc
            
    if best_doc.get("distance", 1.0) > 0.60 or best_score < -1.5:
        return "I don't have enough information to answer this confidently.", {}
        
    meta = best_doc.get("metadata") or {}
    text = best_doc.get("text") or ""
    return f"**According to {meta.get('source_name', '')} ({meta.get('section', '')}):**\n\n{text}", best_doc

def is_doc_cited_in_answer(answer_text: str, doc_metadata: dict) -> bool:
    """
    Strict defensive matching: A retrieved chunk is included in citations ONLY if its SPECIFIC
    section or article identifier (e.g. '3(p)', '3(a)', 'Article 27', 'Section 6') is
    actually mentioned in the generated answer text.
    """
    if not answer_text or not doc_metadata:
        return False
        
    ans_lower = answer_text.lower()
    sec = (doc_metadata.get("section") or "").strip()
    
    if not sec:
        return False
        
    sec_lower = sec.lower()
    
    # 1. Exact string match (e.g., "section 3(p)" in answer)
    if sec_lower in ans_lower:
        return True
        
    # 2. Extract specific section or article identifiers e.g. "3(p)", "3(a)", "3(d)", "3(h)", "6", "27"
    sec_identifiers = re.findall(r"(?:section|article|regulation)?\s*([0-9]+(?:\([a-z0-9]+\))*)", sec_lower)
    
    for identifier in sec_identifiers:
        if not identifier:
            continue
        if identifier.isdigit() and len(identifier) < 2:
            if f"section {identifier}" in ans_lower or f"article {identifier}" in ans_lower or f"regulation {identifier}" in ans_lower:
                return True
        else:
            if identifier in ans_lower:
                return True
                
    return False

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
        retrieved.append({"text": d, "metadata": m or {}, "distance": dist})
        
    top_dist = retrieved[0]["distance"] if retrieved else 1.0
    
    # Pre-check domain relevance for out-of-domain safeguards
    q_words = set(re.findall(r"\w+", req.question.lower()))
    domain_terms = {"patent", "patents", "trademark", "copyright", "design", "gi", "geographical", "ayurveda", "medicine", "drug", "nba", "biodiversity", "fssai", "trips", "cbd", "nagoya", "pct", "madrid", "hague", "budapest", "wipo", "tkdl", "turmeric", "neem", "plant", "farmers", "aahar", "formulation", "herb", "herbal"}
    
    has_domain_term = bool(q_words & domain_terms)
    
    if not has_domain_term and top_dist > 0.50:
        return QueryResponse(
            answer="This question is outside my area — I'm built specifically for Ayurvedic IP and regulatory law questions.",
            confidence="Low",
            citations=[],
            disclaimer="This is informational guidance, not legal advice.",
            escalate_available=True
        )

    # 3. Construct Scenario Application & Strict Readability Prompt for LLM
    context_str = "\n\n".join([
        f"--- Source: {(r.get('metadata') or {}).get('source_name', '')} ({(r.get('metadata') or {}).get('section', '')}) ---\n{r.get('text', '')}"
        for r in retrieved
    ])
    
    system_instruction = (
        "You are IP-SAKTI Sahayak, an AI legal assistant for the Ministry of Ayush specialized in Ayurvedic Intellectual Property and Regulatory Law.\n\n"
        "CORE DUTY:\n"
        "Answer the user's question concisely by APPLYING the provided legal context to the specific product, action, or scenario mentioned in their prompt.\n\n"
        "STRICT FACTUAL GROUNDING RULES:\n"
        "1. IDENTIFY SCENARIO: Identify the exact product name, plant resource, or action mentioned in the user's question (e.g., 'Chawanprash', 'export of raw medicinal herbs', etc.).\n"
        "2. APPLY THE RULE: Apply the retrieved legal principles directly to that specific scenario. Explain WHY and HOW the law applies to their specific case.\n"
        "3. STATUTORY CITATIONS: Explicitly cite the relevant Act name and Section/Article numbers in your answer for every statutory claim made.\n"
        "4. STRICT FACTUAL GROUNDING & NON-OVERREACH:\n"
        "   Every discrete factual or legal claim in your answer MUST be something explicitly stated in a retrieved chunk. Do not include claims or inferences from unretrieved Acts or outside sources.\n"
        "5. SAFEGUARD: If the provided legal context does NOT contain sufficient factual or statutory basis to address the user's specific scenario, you MUST respond strictly with: 'I don't have enough information to answer this confidently.'\n\n"
        "ANSWER FORMATTING RULES FOR MAXIMUM READABILITY & SPEED:\n"
        "1. STANDALONE FIRST LINE: For yes/no or clear-outcome questions, open with a bolded direct outcome as the very first line on its own (e.g., '**No, you cannot patent a classical Ayurvedic formulation like Chawanprash in India.**'). For open-ended questions, bold the single most important takeaway sentence as a standalone first line.\n"
        "2. CONCISE CORE ANSWER: Deliver a concise 2-4 sentence core explanation directly applying the cited sections to the product/scenario. Keep the response tightly focused and avoid redundant restatements."
    )
    
    prompt = f"Jurisdiction Focus: {req.jurisdiction}\nUser Scenario / Question: {req.question}\n\nRetrieved Legal Context:\n{context_str}"
    
    llm_output = call_llm(prompt, system_instruction, max_output_tokens=400)
    primary_doc = None
    
    if not llm_output:
        logger.info("LLM returned empty output; executing fallback RAG synthesis...")
        llm_output, primary_doc = synthesize_rag_fallback(req.question, req.jurisdiction, retrieved)
        
    # 4. Process Answer & Strict Citations Audit
    is_uncertain = "don't have enough information" in llm_output.lower()
    
    citations = []
    cited_chunks_full = []
    if not is_uncertain:
        seen_keys = set()
        
        for r in retrieved:
            if not r or "metadata" not in r:
                continue
            m = r["metadata"] or {}
            s_name = (m.get("source_name") or "").strip()
            sec = (m.get("section") or "").strip()
            u = (m.get("source_url") or "").strip()
            
            key = (s_name, sec, u)
            if key not in seen_keys and s_name:
                # Include citation ONLY if its specific section or article is mentioned in answer
                if is_doc_cited_in_answer(llm_output, m):
                    seen_keys.add(key)
                    citations.append(Citation(
                        source_name=s_name,
                        section=sec,
                        url=u
                    ))
                    cited_chunks_full.append(r)
                    
        # Fallback citation if list is empty (e.g., in fallback mode)
        if not citations and primary_doc:
            m = primary_doc.get("metadata") or {}
            if m.get("source_name"):
                citations.append(Citation(
                    source_name=m.get("source_name") or "",
                    section=m.get("section") or "",
                    url=m.get("source_url") or ""
                ))
                cited_chunks_full.append(primary_doc)

    # 5. Determine Initial Confidence
    if is_uncertain or top_dist > 0.58:
        confidence = "Low"
    elif top_dist < 0.42:
        confidence = "High"
    else:
        confidence = "Medium"
        
    # Determine Initial Escalate Available
    q_lower = req.question.lower()
    high_stakes_keywords = [
        "abs", "biodiversity", "nba", "national biodiversity authority",
        "benefit sharing", "nagoya", "cbd", "filing", "deadline",
        "application", "opposition", "revocation", "penalty", "court"
    ]
    
    is_high_stakes = any(kw in q_lower for kw in high_stakes_keywords)
    escalate = (confidence == "Low") or is_high_stakes

    # 6. Independent Verification Step via Non-Agentic Groq API Model (temperature=0.0)
    if citations and not is_uncertain:
        try:
            verification = verify_answer(llm_output, cited_chunks_full)
            if not verification.get("all_claims_supported", True):
                logger.warning(f"Verification Auditor Flagged Unsupported Claims: {verification.get('unsupported_claims')}")
                confidence = "Low"
                escalate = True
                llm_output += "\n\n*Note: Parts of this answer could not be fully verified against the cited sources — recommend human review for this specific query.*"
        except Exception as v_err:
            logger.warning(f"Verification step encounter exception (ignored for response safety): {v_err}")

    # 7. Presentation-Layer Translation (AFTER verification)
    translated_output = None
    if req.target_language and req.target_language.strip().lower() not in ["english", "en"]:
        try:
            translated_output = translate_answer(llm_output, req.target_language)
        except Exception as t_err:
            logger.warning(f"Translation step failed (fallback to English): {t_err}")
            translated_output = None

    return QueryResponse(
        answer=llm_output,
        translated_answer=translated_output,
        confidence=confidence,
        citations=citations,
        disclaimer="This is informational guidance, not legal advice.",
        escalate_available=escalate
    )

def process_classify(req: ClassifyRequest) -> ClassifyResponse:
    desc = req.description.lower()
    
    system_instruction = (
        "You are an expert Ayurvedic Regulatory Classifier for the Ministry of Ayush.\n"
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
