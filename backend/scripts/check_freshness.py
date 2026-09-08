import os
import re
import json
import hashlib
import requests
from pathlib import Path
from datetime import datetime, timezone
from bs4 import BeautifulSoup
import urllib3

# Suppress SSL warnings if SSL verification fallback is triggered for legacy sites
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# File paths
SCRIPT_DIR = Path(__file__).resolve().parent
BASE_DIR = SCRIPT_DIR.parent.parent
DATA_DIR = BASE_DIR / "data"

BASE_CORPUS_PATH = DATA_DIR / "ayurveda_corpus_base.json"
EXTENDED_CORPUS_PATH = DATA_DIR / "ayurveda_corpus_extended.json"
STATE_FILE_PATH = DATA_DIR / "corpus_freshness_state.json"

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5"
}

def extract_unique_urls() -> list[str]:
    """Extract all unique source_url entries from base and extended corpus JSON files."""
    urls = []
    for corpus_path in [BASE_CORPUS_PATH, EXTENDED_CORPUS_PATH]:
        if corpus_path.exists():
            with open(corpus_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                for item in data:
                    url = item.get("metadata", {}).get("source_url")
                    if url and url.strip() and url.strip() not in urls:
                        urls.append(url.strip())
    return urls

def fetch_and_hash_url(url: str) -> str:
    """Fetch URL, extract visible text via BeautifulSoup, collapse whitespace, and compute SHA256 hash."""
    try:
        resp = requests.get(url, headers=DEFAULT_HEADERS, timeout=15)
        resp.raise_for_status()
    except requests.exceptions.SSLError:
        # Fallback for government portals with legacy SSL certificates
        resp = requests.get(url, headers=DEFAULT_HEADERS, timeout=15, verify=False)
        resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")
    # Extract only visible text via get_text()
    raw_text = soup.get_text()
    # Collapse all repeated whitespace/newlines into single spaces
    cleaned_text = re.sub(r'\s+', ' ', raw_text).strip()
    # Compute SHA256 hash of cleaned text
    return hashlib.sha256(cleaned_text.encode('utf-8')).hexdigest()

def main():
    urls = extract_unique_urls()

    # Load existing state if present
    state = {}
    if STATE_FILE_PATH.exists():
        try:
            with open(STATE_FILE_PATH, "r", encoding="utf-8") as f:
                state = json.load(f)
        except Exception as e:
            state = {}

    now_iso = datetime.now(timezone.utc).isoformat()

    for url in urls:
        try:
            current_hash = fetch_and_hash_url(url)
        except Exception as err:
            print(f"COULD NOT CHECK: {url} — {err}")
            continue

        if url not in state:
            # Baseline entry creation on first run
            state[url] = {
                "hash": current_hash,
                "last_checked": now_iso,
                "pending_changes": 0
            }
            print(f"BASELINE RECORDED: {url}")
        else:
            entry = state[url]
            stored_hash = entry.get("hash")

            if current_hash == stored_hash:
                entry["pending_changes"] = 0
                entry["last_checked"] = now_iso
                print(f"OK: {url}")
            else:
                entry["pending_changes"] = entry.get("pending_changes", 0) + 1
                entry["last_checked"] = now_iso

                if entry["pending_changes"] >= 2:
                    print(f"CHANGED: {url} — needs manual review")
                    entry["hash"] = current_hash
                    entry["pending_changes"] = 0
                else:
                    print(f"POSSIBLE CHANGE (unconfirmed): {url} — will confirm on next run")
                    # Do NOT update stored hash yet

    # Ensure parent directory exists and save state file
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(STATE_FILE_PATH, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)

if __name__ == "__main__":
    main()
