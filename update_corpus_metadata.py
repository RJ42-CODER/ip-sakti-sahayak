import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

def update_metadata():
    # 1. Base Corpus
    base_file = BASE_DIR / "data" / "ayurveda_corpus_base.json"
    with open(base_file, "r", encoding="utf-8") as f:
        base_data = json.load(f)

    base_updates = {
        "Section 3(p)": {
            "source_id": "patents_act_3p",
            "source_name": "Patents Act, 1970",
            "document": "The Patents Act, 1970",
            "section": "Section 3(p)",
            "jurisdiction": "India",
            "official_domain": "ipindia.gov.in",
            "issuing_body": "Indian Patent Office",
            "source_type": "statute",
            "source_url": "https://ipindia.gov.in/acts/patent-act-1970"
        },
        "Section 3(d)": {
            "source_id": "patents_act_3d",
            "source_name": "Patents Act, 1970",
            "document": "The Patents Act, 1970",
            "section": "Section 3(d)",
            "jurisdiction": "India",
            "official_domain": "ipindia.gov.in",
            "issuing_body": "Indian Patent Office",
            "source_type": "statute",
            "source_url": "https://ipindia.gov.in/acts/patent-act-1970"
        },
        "Section 2(1)(j) and 2(1)(ja)": {
            "source_id": "patents_act_2_1_j",
            "source_name": "Patents Act, 1970",
            "document": "The Patents Act, 1970",
            "section": "Section 2(1)(j) and 2(1)(ja)",
            "jurisdiction": "India",
            "official_domain": "ipindia.gov.in",
            "issuing_body": "Indian Patent Office",
            "source_type": "statute",
            "source_url": "https://ipindia.gov.in/acts/patent-act-1970"
        },
        "Section 3": { # Biological Diversity Act
            "source_id": "bda_section_3",
            "source_name": "Biological Diversity Act, 2002",
            "document": "Biological Diversity Act, 2002",
            "section": "Section 3",
            "jurisdiction": "India",
            "official_domain": "indiacode.gov.in",
            "issuing_body": "National Biodiversity Authority",
            "source_type": "statute",
            "source_url": "https://indiacode.gov.in/act/000de0a3-39ce-4e18-85f0-0c51b4bdab5d/sections"
        },
        "Section 6": { # Biological Diversity Act
            "source_id": "bda_section_6",
            "source_name": "Biological Diversity Act, 2002",
            "document": "Biological Diversity Act, 2002",
            "section": "Section 6",
            "jurisdiction": "India",
            "official_domain": "indiacode.gov.in",
            "issuing_body": "National Biodiversity Authority",
            "source_type": "statute",
            "source_url": "https://indiacode.gov.in/act/000de0a3-39ce-4e18-85f0-0c51b4bdab5d/sections"
        },
        "Section 3(a)": {
            "source_id": "drugs_and_cosmetics_3a",
            "source_name": "Drugs and Cosmetics Act, 1940",
            "document": "Drugs and Cosmetics Act, 1940",
            "section": "Section 3(a)",
            "jurisdiction": "India",
            "official_domain": "indiacode.gov.in",
            "issuing_body": "Central Drugs Standard Control Organisation",
            "source_type": "statute",
            "source_url": "https://indiacode.gov.in/act/8725a8a7-45a4-42e3-9046-e2a6383cd049/sections"
        },
        "Section 3(h)": {
            "source_id": "drugs_and_cosmetics_3h",
            "source_name": "Drugs and Cosmetics Act, 1940",
            "document": "Drugs and Cosmetics Act, 1940",
            "section": "Section 3(h)",
            "jurisdiction": "India",
            "official_domain": "indiacode.gov.in",
            "issuing_body": "Central Drugs Standard Control Organisation",
            "source_type": "statute",
            "source_url": "https://indiacode.gov.in/act/8725a8a7-45a4-42e3-9046-e2a6383cd049/sections"
        },
        "Section 9": { # GI Act
            "source_id": "gi_act_9",
            "source_name": "Geographical Indications of Goods Act, 1999",
            "document": "Geographical Indications of Goods Act, 1999",
            "section": "Section 9",
            "jurisdiction": "India",
            "official_domain": "indiacode.gov.in",
            "issuing_body": "Geographical Indications Registry",
            "source_type": "statute",
            "source_url": "https://indiacode.gov.in/act/1905d861-7dcd-46d6-a03b-4fe6009dea5b/sections"
        },
        "Section 11": { # GI Act
            "source_id": "gi_act_11",
            "source_name": "Geographical Indications of Goods Act, 1999",
            "document": "Geographical Indications of Goods Act, 1999",
            "section": "Section 11",
            "jurisdiction": "India",
            "official_domain": "indiacode.gov.in",
            "issuing_body": "Geographical Indications Registry",
            "source_type": "statute",
            "source_url": "https://indiacode.gov.in/act/1905d861-7dcd-46d6-a03b-4fe6009dea5b/sections"
        },
        "Public Documentation - About TKDL": {
            "source_id": "tkdl_defense",
            "source_name": "Traditional Knowledge Digital Library",
            "document": "TKDL Prior Art Database Documentation",
            "section": "Public Documentation - About TKDL",
            "jurisdiction": "India",
            "official_domain": "tkdl.res.in",
            "issuing_body": "CSIR & Ministry of Ayush",
            "source_type": "prior_art",
            "source_url": "https://www.tkdl.res.in/"
        },
        "Turmeric Revocation Case": {
            "source_id": "turmeric_case_uspto",
            "source_name": "USPTO Patent Records / CSIR Archives",
            "document": "US Patent 5,401,504 Revocation Proceeding",
            "section": "Turmeric Revocation Case",
            "jurisdiction": "International",
            "official_domain": "uspto.gov",
            "issuing_body": "United States Patent and Trademark Office",
            "source_type": "case_precedent",
            "source_url": "https://www.uspto.gov/patents/search"
        },
        "Neem Revocation Case": {
            "source_id": "neem_case_epo",
            "source_name": "EPO Patent Records / Traditional Knowledge Defense Cases",
            "document": "EP Patent 0436257 Opposition & Revocation Appeal",
            "section": "Neem Revocation Case",
            "jurisdiction": "International",
            "official_domain": "epo.org",
            "issuing_body": "European Patent Office",
            "source_type": "case_precedent",
            "source_url": "https://www.epo.org/en/searching-for-patents"
        }
    }

    for item in base_data:
        meta = item.get("metadata", {})
        sec = meta.get("section")
        if sec in base_updates:
            meta.update(base_updates[sec])

    with open(base_file, "w", encoding="utf-8") as f:
        json.dump(base_data, f, indent=2, ensure_ascii=False)
    print("Updated ayurveda_corpus_base.json")

    # 2. Extended Corpus
    ext_file = BASE_DIR / "data" / "ayurveda_corpus_extended.json"
    with open(ext_file, "r", encoding="utf-8") as f:
        ext_data = json.load(f)

    ext_updates = {
        "Section 9(1)": {
            "source_id": "trademark_act_9",
            "source_name": "Trade Marks Act, 1999",
            "document": "Trade Marks Act, 1999",
            "section": "Section 9(1)",
            "jurisdiction": "India",
            "official_domain": "indiacode.gov.in",
            "issuing_body": "Trade Marks Registry",
            "source_type": "statute",
            "source_url": "https://indiacode.gov.in/act/62219d21-0553-405b-9ccb-a11b4d9c41c2/sections"
        },
        "Section 4": {
            "source_id": "designs_act_4",
            "source_name": "Designs Act, 2000",
            "document": "Designs Act, 2000",
            "section": "Section 4",
            "jurisdiction": "India",
            "official_domain": "indiacode.gov.in",
            "issuing_body": "Patent & Design Office",
            "source_type": "statute",
            "source_url": "https://indiacode.gov.in/act/cd8f2852-7085-432b-a264-7b73a6f01fff/sections"
        },
        "Section 13": {
            "source_id": "copyright_act_13",
            "source_name": "Copyright Act, 1957",
            "document": "Copyright Act, 1957",
            "section": "Section 13",
            "jurisdiction": "India",
            "official_domain": "indiacode.gov.in",
            "issuing_body": "Copyright Office",
            "source_type": "statute",
            "source_url": "https://indiacode.gov.in/act/6b893162-631a-453b-a7b9-89685716889b/sections"
        },
        "Section 39": {
            "source_id": "ppvfr_act_39",
            "source_name": "Protection of Plant Varieties and Farmers' Rights Act, 2001",
            "document": "Protection of Plant Varieties and Farmers' Rights Act, 2001",
            "section": "Section 39",
            "jurisdiction": "India",
            "official_domain": "indiacode.gov.in",
            "issuing_body": "PPV&FR Authority",
            "source_type": "statute",
            "source_url": "https://indiacode.gov.in/act/66408705-b196-477f-9229-dc633f393a23/sections"
        },
        "Regulation 2": {
            "source_id": "fssai_ayurveda_aahara_2",
            "source_name": "Food Safety and Standards (Ayurveda Aahara) Regulations, 2022",
            "document": "Food Safety and Standards (Ayurveda Aahara) Regulations, 2022",
            "section": "Regulation 2",
            "jurisdiction": "India",
            "official_domain": "fssai.gov.in",
            "issuing_body": "Food Safety and Standards Authority of India",
            "source_type": "regulation",
            "source_url": "https://www.fssai.gov.in/"
        },
        "Article 27": {
            "source_id": "trips_art_27",
            "source_name": "TRIPS Agreement (WTO)",
            "document": "TRIPS Agreement",
            "section": "Article 27",
            "jurisdiction": "International",
            "official_domain": "wto.org",
            "issuing_body": "World Trade Organization",
            "source_type": "treaty",
            "source_url": "https://www.wto.org/english/docs_e/legal_e/27-trips_04c_e.htm"
        },
        "Article 15": {
            "source_id": "cbd_art_15",
            "source_name": "Convention on Biological Diversity (CBD)",
            "document": "Convention on Biological Diversity",
            "section": "Article 15",
            "jurisdiction": "International",
            "official_domain": "cbd.int",
            "issuing_body": "Secretariat of the Convention on Biological Diversity",
            "source_type": "treaty",
            "source_url": "https://www.cbd.int/convention/articles/?a=cbd-15"
        },
        "Article 5": {
            "source_id": "nagoya_art_5",
            "source_name": "Nagoya Protocol (CBD)",
            "document": "Nagoya Protocol on Access and Benefit Sharing",
            "section": "Article 5",
            "jurisdiction": "International",
            "official_domain": "cbd.int",
            "issuing_body": "Secretariat of the Convention on Biological Diversity",
            "source_type": "treaty",
            "source_url": "https://www.cbd.int/abs/text/articles/?sec=abs-05"
        },
        "Article 3": {
            "source_id": "wipo_gratk_art_3",
            "source_name": "WIPO Treaty on IP, Genetic Resources and Associated Traditional Knowledge (2024)",
            "document": "WIPO Treaty on IP, Genetic Resources and Associated Traditional Knowledge (2024)",
            "section": "Article 3",
            "jurisdiction": "International",
            "official_domain": "wipo.int",
            "issuing_body": "World Intellectual Property Organization",
            "source_type": "treaty",
            "source_url": "https://www.wipo.int/wipolex/en/text/586737"
        },
        "Article 3 and Article 15": {
            "source_id": "pct_art_3_15",
            "source_name": "Patent Cooperation Treaty (PCT)",
            "document": "Patent Cooperation Treaty",
            "section": "Article 3 and Article 15",
            "jurisdiction": "International",
            "official_domain": "wipo.int",
            "issuing_body": "World Intellectual Property Organization",
            "source_type": "treaty",
            "source_url": "https://www.wipo.int/pct/en/texts/articles/a3.html"
        },
        "Articles 2 and 3": {
            "source_id": "madrid_system_wipo",
            "source_name": "Madrid System (WIPO)",
            "document": "Madrid Agreement Concerning the International Registration of Marks",
            "section": "Articles 2 and 3",
            "jurisdiction": "International",
            "official_domain": "wipo.int",
            "issuing_body": "World Intellectual Property Organization",
            "source_type": "treaty",
            "source_url": "https://www.wipo.int/madrid/en/legal_texts/tr_madrid.html"
        },
        "Articles 4 and 5": {
            "source_id": "hague_system_wipo",
            "source_name": "Hague System (WIPO)",
            "document": "Hague Agreement Concerning the International Registration of Industrial Designs",
            "section": "Articles 4 and 5",
            "jurisdiction": "International",
            "official_domain": "wipo.int",
            "issuing_body": "World Intellectual Property Organization",
            "source_type": "treaty",
            "source_url": "https://www.wipo.int/hague/en/legal_texts/"
        }
    }

    for item in ext_data:
        meta = item.get("metadata", {})
        sec = meta.get("section")
        sname = meta.get("source_name", "")
        if "Budapest" in sname:
            meta.update({
                "source_id": "budapest_treaty_wipo",
                "source_name": "Budapest Treaty (WIPO)",
                "document": "Budapest Treaty on Microorganisms Deposit",
                "section": "Article 3",
                "jurisdiction": "International",
                "official_domain": "wipo.int",
                "issuing_body": "World Intellectual Property Organization",
                "source_type": "treaty",
                "source_url": "https://www.wipo.int/budapest/en/"
            })
        elif sec in ext_updates:
            meta.update(ext_updates[sec])

    with open(ext_file, "w", encoding="utf-8") as f:
        json.dump(ext_data, f, indent=2, ensure_ascii=False)
    print("Updated ayurveda_corpus_extended.json")

if __name__ == "__main__":
    update_metadata()
