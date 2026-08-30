import json
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    print("--- GET /api/health ---")
    print(res.status_code, res.json())
    assert res.status_code == 200

def test_queries():
    test_cases = [
        {
            "question": "Can I patent a classical Ayurvedic formulation like Chawanprash in India?",
            "jurisdiction": "India"
        },
        {
            "question": "Do I need NBA approval to export Indian medicinal plants for foreign commercial research?",
            "jurisdiction": "India"
        },
        {
            "question": "What does Article 27 of the TRIPS Agreement state regarding patent exclusions for therapeutic methods?",
            "jurisdiction": "International"
        },
        {
            "question": "What is the quantum computing algorithm for Ayush drugs?",
            "jurisdiction": "India"
        }
    ]

    print("\n==================================================")
    print("           TESTING POST /api/query                ")
    print("==================================================")
    for case in test_cases:
        res = client.post("/api/query", json=case)
        print(f"\n[Q]: {case['question']} (Jurisdiction: {case['jurisdiction']})")
        print(f"Status: {res.status_code}")
        data = res.json()
        print(json.dumps(data, indent=2))
        assert res.status_code == 200
        assert "answer" in data
        assert "confidence" in data
        assert "citations" in data
        assert "disclaimer" in data
        assert "escalate_available" in data

def test_classifications():
    test_cases = [
        {"description": "Chawanprash manufactured strictly according to the formula described in Sharangdhara Samhita."},
        {"description": "Ayurvedic cough syrup containing Ashwagandha and Tulsi in modern syrup vehicle packaged in 100ml PET bottle."},
        {"description": "Herbal hair vitalizing oil with Amla, Bhringraj, and Coconut oil for external scalp massage and hair nourishment."},
        {"description": "A novel food beverage infused with Brahmi and Shankhpushpi marketed as a daily health tonic under FSSAI regulations."}
    ]

    print("\n==================================================")
    print("          TESTING POST /api/classify              ")
    print("==================================================")
    for case in test_cases:
        res = client.post("/api/classify", json=case)
        print(f"\n[Description]: {case['description']}")
        print(f"Status: {res.status_code}")
        data = res.json()
        print(json.dumps(data, indent=2))
        assert res.status_code == 200
        assert "category" in data
        assert "confidence" in data

if __name__ == "__main__":
    test_health()
    test_queries()
    test_classifications()
    print("\nALL API CONTRACT TESTS PASSED PERFECTLY!")
