import json
from pathlib import Path

data_dir = Path(__file__).resolve().parent.parent / "data"

url_mapping = {
    "Patents Act": "https://ipindia.gov.in/acts/patent-act-1970",
    "Biological Diversity Act": "https://indiacode.gov.in/act/000de0a3-39ce-4e18-85f0-0c51b4bdab5d/sections",
    "Designs Act": "https://indiacode.gov.in/act/cd8f2852-7085-432b-a264-7b73a6f01fff/sections",
    "Trade Marks Act": "https://indiacode.gov.in/act/62219d21-0553-405b-9ccb-a11b4d9c41c2/sections" ,
    "Copyright Act": "https://indiacode.gov.in/act/6b893162-631a-453b-a7b9-89685716889b/sections",
    "Plant Varieties": "https://indiacode.gov.in/act/66408705-b196-477f-9229-dc633f393a23/sections",
    "PPV&FR": "https://indiacode.gov.in/act/66408705-b196-477f-9229-dc633f393a23/sections",
    "Geographical Indications": "https://indiacode.gov.in/act/1905d861-7dcd-46d6-a03b-4fe6009dea5b/sections",
    "GI Act": "https://indiacode.gov.in/act/1905d861-7dcd-46d6-a03b-4fe6009dea5b/sections",
    "Drugs and Cosmetics": "https://indiacode.gov.in/act/8725a8a7-45a4-42e3-9046-e2a6383cd049/sections"
}

files = ["ayurveda_corpus_base.json", "ayurveda_corpus_extended.json"]

fssai_flagged_list = []

for fname in files:
    fpath = data_dir / fname
    if not fpath.exists():
        continue
    
    with open(fpath, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    updated_count = 0
    for entry in data:
        meta = entry.get("metadata", {})
        s_name = meta.get("source_name", "")
        
        # Check matching acts
        for act_key, new_url in url_mapping.items():
            if act_key.lower() in s_name.lower():
                old_u = meta.get("source_url", "")
                meta["source_url"] = new_url
                updated_count += 1
                print(f"Updated '{s_name}' ({meta.get('section', '')}) URL:\n  OLD: {old_u}\n  NEW: {new_url}")
                break
                
        # Check FSSAI entry
        if "fssai" in s_name.lower() or "aahar" in s_name.lower() or "ayurveda-aahar" in s_name.lower():
            old_url = meta.get("source_url", "")
            if old_url != "https://www.fssai.gov.in/":
                fssai_flagged_list.append((s_name, old_url))
                meta["source_url"] = "https://www.fssai.gov.in/"
                updated_count += 1
                
    with open(fpath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print(f"\n--- Total Updated in {fname}: {updated_count} entries ---")

if fssai_flagged_list:
    print("\n==========================================")
    print("  [FSSAI FLAG REPORT]")
    print("==========================================")
    for sname, oldurl in fssai_flagged_list:
        print(f"Flagged FSSAI entry '{sname}' with old URL: {oldurl}")
        print("Updated to: https://www.fssai.gov.in/")
