import os
import sys
import httpx
from pathlib import Path
from dotenv import load_dotenv

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

backend_env = Path(__file__).resolve().parent.parent / "backend" / ".env"
load_dotenv(backend_env)

key = os.getenv("GROQ_API_KEY")

url = "https://api.groq.com/openai/v1/chat/completions"
headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}

for model_name in ["llama-3.1-8b-instant", "llama3-8b-8192", "mixtral-8x7b-32768", "gemma2-9b-it"]:
    payload = {
        "model": model_name,
        "messages": [{"role": "user", "content": "Hello from SIH 2026 test"}]
    }
    try:
        res = httpx.post(url, headers=headers, json=payload, timeout=10.0)
        if res.status_code == 200:
            data = res.json()
            text = data["choices"][0]["message"]["content"]
            print(f"✅ Groq Success with model '{model_name}':", text.strip())
            break
        else:
            print(f"❌ Groq model '{model_name}' status:", res.status_code)
    except Exception as e:
        print(f"❌ Groq model '{model_name}' exception:", e)
