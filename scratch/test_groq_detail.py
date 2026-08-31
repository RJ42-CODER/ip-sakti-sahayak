import os, httpx
from dotenv import load_dotenv
load_dotenv('backend/.env')
key = os.getenv('GROQ_API_KEY')
res = httpx.post('https://api.groq.com/openai/v1/chat/completions', headers={'Authorization': 'Bearer ' + key}, json={'model': 'llama3-8b-8192', 'messages': [{'role': 'user', 'content': 'Hello'}]})
print(res.status_code, res.json())
