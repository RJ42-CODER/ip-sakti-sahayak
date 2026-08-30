import os
import glob
import json
import sys
from pathlib import Path
from collections import defaultdict
import chromadb
from sentence_transformers import SentenceTransformer

# Ensure UTF-8 output encoding for Windows consoles
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

# Paths configuration
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
CHROMA_PERSIST_DIR = BASE_DIR / "backend" / "chroma_db"
COLLECTION_NAME = "ayurveda_legal_kb"
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"

def chunk_text(text: str, max_words: int = 400) -> list[str]:
    """
    Chunks text at natural paragraph boundaries if word count exceeds max_words.
    """
    words = text.split()
    if len(words) <= max_words:
        return [text]
    
    paragraphs = text.split("\n\n")
    if len(paragraphs) == 1:
        paragraphs = text.split("\n")
        
    chunks = []
    current_chunk = []
    current_word_count = 0
    
    for p in paragraphs:
        p_words = len(p.split())
        if current_word_count + p_words > max_words and current_chunk:
            chunks.append("\n\n".join(current_chunk))
            current_chunk = [p]
            current_word_count = p_words
        else:
            current_chunk.append(p)
            current_word_count += p_words
            
    if current_chunk:
        chunks.append("\n\n".join(current_chunk))
        
    return chunks

def load_data_files(data_dir: Path) -> list[dict]:
    """
    Automatically loads all JSON files in the data directory.
    """
    json_files = glob.glob(str(data_dir / "*.json"))
    documents = []
    
    print(f"[DATA] Scanning for data files in: {data_dir}")
    for file_path in json_files:
        print(f"   -> Loading: {os.path.basename(file_path)}")
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list):
                documents.extend(data)
            else:
                documents.append(data)
                
    print(f"Total raw legal entries loaded across files: {len(documents)}")
    return documents

def run_ingestion():
    print("==================================================")
    print("  IP-SAKTI Sahayak -- Vector Ingestion Pipeline   ")
    print("==================================================")
    
    # 1. Load Data
    raw_documents = load_data_files(DATA_DIR)
    if not raw_documents:
        print("[ERROR] No JSON data files found in /data directory.")
        return

    # 2. Chunking & Metadata Preparation
    chunks_to_embed = []
    metadata_list = []
    doc_ids = []
    
    summary_counter = defaultdict(lambda: defaultdict(int))

    chunk_seq = 0
    for doc_idx, doc in enumerate(raw_documents):
        text = doc.get("text", "")
        meta = doc.get("metadata", {})
        
        # Ensure mandatory metadata fields exist
        jurisdiction = meta.get("jurisdiction", "Unknown")
        law_type = meta.get("law_type", "General")
        
        doc_chunks = chunk_text(text, max_words=400)
        
        for c_idx, chunk_content in enumerate(doc_chunks):
            chunk_seq += 1
            chunk_id = f"doc_{doc_idx}_chunk_{c_idx}_{chunk_seq}"
            
            # Copy all original metadata and include chunk information
            chunk_metadata = dict(meta)
            chunk_metadata["chunk_index"] = c_idx
            chunk_metadata["total_chunks"] = len(doc_chunks)
            
            chunks_to_embed.append(chunk_content)
            metadata_list.append(chunk_metadata)
            doc_ids.append(chunk_id)
            
            # Count for summary
            summary_counter[jurisdiction][law_type] += 1

    print(f"\n[CHUNKING] Total processed chunks ready for embedding: {len(chunks_to_embed)}")

    # 3. Generate Embeddings locally
    print(f"\n[MODEL] Loading HuggingFace model '{EMBEDDING_MODEL_NAME}'...")
    embedder = SentenceTransformer(EMBEDDING_MODEL_NAME)
    print("   Generating embeddings for chunks...")
    embeddings = embedder.encode(chunks_to_embed, show_progress_bar=False).tolist()

    # 4. Store in ChromaDB
    print(f"\n[CHROMADB] Initializing local ChromaDB client at: {CHROMA_PERSIST_DIR}")
    client = chromadb.PersistentClient(path=str(CHROMA_PERSIST_DIR))

    # Safe re-runnability: wipe existing collection if present
    existing_collections = [c.name for c in client.list_collections()]
    if COLLECTION_NAME in existing_collections:
        print(f"   Deleting existing collection '{COLLECTION_NAME}' for clean reload...")
        client.delete_collection(name=COLLECTION_NAME)

    collection = client.create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )

    print(f"   Inserting {len(chunks_to_embed)} vector records into collection '{COLLECTION_NAME}'...")
    collection.add(
        documents=chunks_to_embed,
        embeddings=embeddings,
        metadatas=metadata_list,
        ids=doc_ids
    )

    print("\n[SUCCESS] Ingestion complete & persistent DB updated successfully!")

    # 5. Print Summary
    print("\n==================================================")
    print("               INGESTION SUMMARY                  ")
    print("==================================================")
    print(f"{'JURISDICTION':<18} | {'LAW TYPE':<32} | {'CHUNKS':<8}")
    print("-" * 64)
    
    total_all_chunks = 0
    for jurisdiction, law_types in sorted(summary_counter.items()):
        for law_type, count in sorted(law_types.items()):
            print(f"{jurisdiction:<18} | {law_type:<32} | {count:<8}")
            total_all_chunks += count
            
    print("-" * 64)
    print(f"TOTAL CHUNKS STORED: {total_all_chunks}")
    print("==================================================\n")

if __name__ == "__main__":
    run_ingestion()
