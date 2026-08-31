import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

backend_env = Path(__file__).resolve().parent.parent / "backend" / ".env"
load_dotenv(backend_env)

key = os.getenv("GEMINI_API_KEY")
print("GEMINI_API_KEY loaded:", bool(key))

genai.configure(api_key=key)

print("Listing available models:")
for m in genai.list_models():
    if "generateContent" in m.supported_generation_methods:
        print("  -", m.name)

# Test first available model
available = [m.name for m in genai.list_models() if "generateContent" in m.supported_generation_methods]
if available:
    target_model = available[0]
    print(f"\nTesting generation with model: {target_model}")
    model = genai.GenerativeModel(model_name=target_model)
    res = model.generate_content("Hello from SIH 2026 test")
    print("Response:", res.text.strip())
