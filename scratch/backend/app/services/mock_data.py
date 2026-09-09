"""Synthetic Investigation Dataset for NEXUS Prototype.

DISCLAIMER:
All data in this file is purely fictional and synthetically generated for software prototyping
and algorithmic evaluation. It does not represent real persons, criminal records, police files,
or law enforcement investigations. Persons are classified as subjects of interest requiring
human review, not criminals.
"""

SYNTHETIC_DATASET_LABEL = "Synthetic Investigation Dataset"

# 1. Primary Synthetic Case: Operation Chakravyuh
SYNTHETIC_CASES = [
    {
        "id": "case-sih-01",
        "case_number": "CASE-2026-NCR-09",
        "title": "Operation Chakravyuh",
        "description": (
            "Synthetic investigation scenario into inter-state logistics corridors and transactional "
            "anomaly correlations across Delhi, Ghaziabad, Noida, and Lucknow. "
            "All findings are algorithmic risk indicators requiring human review."
        ),
        "code_name": "CHAKRAVYUH",
        "status": "Active Investigation",
        "priority": "CRITICAL",
        "lead_investigator": "ACP Vikramaditya Rathore",
        "agency": "Special Investigation Cell (Synthetic Unit)",
        "jurisdiction": "Delhi NCR / Uttar Pradesh Crime Corridor",
        "opened_date": "2026-06-15",
        "last_updated": "2026-09-08T00:00:00Z",
        "warrants_issued": 3,
        "assets_seized": "₹1.85 Crore",
        "entities_count": 7,
        "evidence_count": 3,
        "risk_index": 88,
        "dataset_label": SYNTHETIC_DATASET_LABEL
    }
]

# 2. 7 Synthetic Entities (Neutral, Ethical, No "Criminal" Labels)
SYNTHETIC_ENTITIES = [
    {
        "id": "ent-1",
        "name": "Rahul Verma",
        "type": "subject_of_interest",
        "risk_score": 88,
        "risk_level": "CRITICAL",
        "status": "Requires Human Review",
        "aliases": ["RV"],
        "primary_affiliation": "Apex Logistics Front",
        "role": "Primary Logistics Coordinator",
        "phone_masked": "+91 98XXXXXX21",
        "city": "Delhi",
        "nationality": "Indian",
        "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
        "last_known_location": {
            "name": "Connaught Place Inner Circle",
            "city": "Delhi",
            "lat": 28.6315,
            "lng": 77.2167,
            "timestamp": "2026-09-07T21:40:00Z"
        },
        "tags": ["Corridor Focus", "Logistics Dispatch"],
        "details": {
            "known_associates_count": 4,
            "total_financial_flow": "₹28,50,000",
            "wiretaps_count": 3,
            "dob": "1984-07-12",
            "pob": "New Delhi",
            "wanted_for": ["Section 420 Inquiry (Fictional)", "Commercial Registry Discrepancy"]
        },
        "dataset_label": SYNTHETIC_DATASET_LABEL
    },
    {
        "id": "ent-2",
        "name": "Amit Yadav",
        "type": "subject_of_interest",
        "risk_score": 82,
        "risk_level": "CRITICAL",
        "status": "Requires Human Review",
        "aliases": ["Yadav Ji"],
        "primary_affiliation": "Yadav Commercial Trading",
        "role": "Financial & Transfer Facilitator",
        "phone_masked": "+91 97XXXXXX45",
        "vehicle_number": "UP14 AB 1234",
        "city": "Ghaziabad",
        "nationality": "Indian",
        "photo": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
        "last_known_location": {
            "name": "Indirapuram Sector 12",
            "city": "Ghaziabad",
            "lat": 28.6415,
            "lng": 77.3714,
            "timestamp": "2026-09-07T22:15:00Z"
        },
        "tags": ["Financial Intermediary", "Fastag Owner"],
        "details": {
            "known_associates_count": 3,
            "total_financial_flow": "₹17,70,000",
            "wiretaps_count": 2,
            "dob": "1989-11-04",
            "pob": "Ghaziabad"
        },
        "dataset_label": SYNTHETIC_DATASET_LABEL
    },
    {
        "id": "ent-3",
        "name": "Priya Singh",
        "type": "subject_of_interest",
        "risk_score": 78,
        "risk_level": "HIGH",
        "status": "Flagged Entity",
        "aliases": ["PS Consult"],
        "primary_affiliation": "Singh Overseas Consultancy",
        "role": "Corporate Account Signatory",
        "phone_masked": "+91 99XXXXXX88",
        "city": "Noida",
        "nationality": "Indian",
        "photo": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
        "last_known_location": {
            "name": "Sector 62 IT Complex",
            "city": "Noida",
            "lat": 28.6280,
            "lng": 77.3649,
            "timestamp": "2026-09-06T18:30:00Z"
        },
        "tags": ["Consultancy Front", "Banking Discrepancy"],
        "details": {
            "known_associates_count": 2,
            "total_financial_flow": "₹14,20,000",
            "wiretaps_count": 1,
            "dob": "1992-03-22",
            "pob": "Noida"
        },
        "dataset_label": SYNTHETIC_DATASET_LABEL
    },
    {
        "id": "ent-4",
        "name": "Suresh Sharma",
        "type": "subject_of_interest",
        "risk_score": 74,
        "risk_level": "HIGH",
        "status": "Under Review",
        "aliases": ["Pandit Ji"],
        "primary_affiliation": "National Freight Corridor",
        "role": "Highway Fleet Dispatcher",
        "phone_masked": "+91 88XXXXXX12",
        "city": "Lucknow",
        "nationality": "Indian",
        "photo": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80",
        "last_known_location": {
            "name": "Hazratganj Transit Hub",
            "city": "Lucknow",
            "lat": 26.8530,
            "lng": 80.9460,
            "timestamp": "2026-09-07T14:10:00Z"
        },
        "tags": ["Fleet Logistics", "Lucknow Hub"],
        "details": {
            "known_associates_count": 3,
            "total_financial_flow": "₹9,80,000",
            "wiretaps_count": 1,
            "dob": "1981-05-19",
            "pob": "Lucknow"
        },
        "dataset_label": SYNTHETIC_DATASET_LABEL
    },
    {
        "id": "ent-5",
        "name": "Neha Gupta",
        "type": "subject_of_interest",
        "risk_score": 69,
        "risk_level": "ELEVATED",
        "status": "Monitored Profile",
        "aliases": ["NG Mirzapur"],
        "primary_affiliation": "Telecom Operations Auxiliary",
        "role": "Telecom Relay Point Contact",
        "phone_masked": "+91 96XXXXXX33",
        "city": "Mirzapur",
        "nationality": "Indian",
        "photo": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
        "last_known_location": {
            "name": "Vindhyachal Corridor Area",
            "city": "Mirzapur",
            "lat": 25.1337,
            "lng": 82.5644,
            "timestamp": "2026-09-07T09:15:00Z"
        },
        "tags": ["Telecom Node", "Relay Contact"],
        "details": {
            "known_associates_count": 2,
            "total_financial_flow": "₹3,40,000",
            "wiretaps_count": 2,
            "dob": "1995-09-14",
            "pob": "Mirzapur"
        },
        "dataset_label": SYNTHETIC_DATASET_LABEL
    },
    {
        "id": "ent-v1",
        "name": "Mahindra Scorpio (UP14 AB 1234)",
        "type": "vehicle",
        "risk_score": 75,
        "risk_level": "HIGH",
        "status": "Tracked Asset",
        "aliases": ["Black Scorpio"],
        "primary_affiliation": "Registered to Amit Yadav",
        "role": "Highway Transport Vehicle",
        "vehicle_number": "UP14 AB 1234",
        "city": "Noida / Yamuna Expressway",
        "nationality": "Indian Registry",
        "photo": None,
        "last_known_location": {
            "name": "Jewar Toll Plaza, Yamuna Expressway",
            "city": "Noida",
            "lat": 28.1293,
            "lng": 77.5539,
            "timestamp": "2026-09-07T19:15:00Z"
        },
        "tags": ["FASTag Anomaly", "Yamuna Expressway"],
        "details": {
            "known_associates_count": 2,
            "total_financial_flow": "₹0",
            "wiretaps_count": 0
        },
        "dataset_label": SYNTHETIC_DATASET_LABEL
    },
    {
        "id": "ent-b1",
        "name": "Canara Bank Commercial Acct #0492",
        "type": "bank_account",
        "risk_score": 80,
        "risk_level": "HIGH",
        "status": "Flagged Account",
        "aliases": ["Hazratganj Acct"],
        "primary_affiliation": "Canara Bank, Hazratganj Branch",
        "role": "Corporate Holding Account",
        "city": "Lucknow",
        "nationality": "Indian Banking",
        "photo": None,
        "last_known_location": {
            "name": "Hazratganj Branch",
            "city": "Lucknow",
            "lat": 26.8500,
            "lng": 80.9400,
            "timestamp": "2026-09-06T14:00:00Z"
        },
        "tags": ["High-Value Transfers", "Rapid Clearing"],
        "details": {
            "known_associates_count": 2,
            "total_financial_flow": "₹12,50,000",
            "wiretaps_count": 0
        },
        "dataset_label": SYNTHETIC_DATASET_LABEL
    }
]

# 3. 10 Synthetic Network Relationships
SYNTHETIC_EDGES = [
    {
        "id": "e-1",
        "source": "ent-1",
        "target": "ent-2",
        "relationship": "financial_transfer",
        "label": "Informal Layered Transfer ₹12.5L",
        "amount_inr": "₹12,50,000",
        "is_suspicious": True,
        "weight": 8.0
    },
    {
        "id": "e-2",
        "source": "ent-1",
        "target": "ent-3",
        "relationship": "commercial_associate",
        "label": "Corporate Directorship Link",
        "amount_inr": None,
        "is_suspicious": True,
        "weight": 7.0
    },
    {
        "id": "e-3",
        "source": "ent-1",
        "target": "ent-4",
        "relationship": "logistics_coordination",
        "label": "Consignment Escort Request",
        "amount_inr": None,
        "is_suspicious": True,
        "weight": 6.0
    },
    {
        "id": "e-4",
        "source": "ent-2",
        "target": "ent-b1",
        "relationship": "banking_deposit",
        "label": "Structured Deposit ₹5.2L",
        "amount_inr": "₹5,20,000",
        "is_suspicious": True,
        "weight": 8.0
    },
    {
        "id": "e-5",
        "source": "ent-3",
        "target": "ent-b1",
        "relationship": "banking_withdrawal",
        "label": "Corporate Account Outflow ₹7.3L",
        "amount_inr": "₹7,30,000",
        "is_suspicious": True,
        "weight": 7.0
    },
    {
        "id": "e-6",
        "source": "ent-2",
        "target": "ent-v1",
        "relationship": "registered_keeper",
        "label": "Vehicle Registry Record",
        "amount_inr": None,
        "is_suspicious": False,
        "weight": 5.0
    },
    {
        "id": "e-7",
        "source": "ent-4",
        "target": "ent-v1",
        "relationship": "transit_observation",
        "label": "Yamuna Expressway Transit Log",
        "amount_inr": None,
        "is_suspicious": True,
        "weight": 6.0
    },
    {
        "id": "e-8",
        "source": "ent-2",
        "target": "ent-5",
        "relationship": "telecom_contact",
        "label": "Telecom Call Cluster (36 calls)",
        "amount_inr": None,
        "frequency": 36,
        "is_suspicious": True,
        "weight": 7.0
    },
    {
        "id": "e-9",
        "source": "ent-1",
        "target": "ent-5",
        "relationship": "telecom_contact",
        "label": "Direct Line Pings (4 calls)",
        "amount_inr": None,
        "frequency": 4,
        "is_suspicious": True,
        "weight": 5.0
    },
    {
        "id": "e-10",
        "source": "ent-3",
        "target": "ent-4",
        "relationship": "business_contact",
        "label": "Freight Clearance Documentation",
        "amount_inr": None,
        "is_suspicious": False,
        "weight": 4.0
    }
]

# 4. 2 Possible Patterns (Neutral Modus Operandi Indicators)
SYNTHETIC_PATTERNS = [
    {
        "id": "pat-1",
        "title": "Possible Layered Financial Pattern",
        "category": "Financial Routing",
        "description": (
            "Sequential funds distribution of ₹12,50,000 originating from Delhi, routed through "
            "Amit Yadav in Ghaziabad, and deposited into Lucknow commercial account within 6 hours. "
            "Requires human review."
        ),
        "confidence": 91,
        "involved_entities": ["Rahul Verma", "Amit Yadav", "Priya Singh"],
        "locations": ["Delhi (Connaught Place)", "Ghaziabad (Indirapuram)", "Lucknow (Hazratganj)"],
        "key_metric": "₹12,50,000 across 3 hops",
        "severity": "HIGH",
        "review_status": "Requires Human Review"
    },
    {
        "id": "pat-2",
        "title": "Possible Coordinated Highway Transit Pattern",
        "category": "Transit Correlation",
        "description": (
            "Mahindra Scorpio (UP14 AB 1234) logged crossing Jewar Toll Plaza on Yamuna Expressway, "
            "matching telecom tower handovers towards Lucknow. Requires human review."
        ),
        "confidence": 86,
        "involved_entities": ["Amit Yadav", "Suresh Sharma", "Mahindra Scorpio (UP14 AB 1234)"],
        "locations": ["Noida Sector 62", "Jewar Toll Plaza", "Lucknow Transit Hub"],
        "key_metric": "Jewar Plaza toll handover",
        "severity": "ELEVATED",
        "review_status": "Requires Human Review"
    }
]

# 5. 3 Threat Alerts (Fictional Indicators)
SYNTHETIC_ALERTS = [
    {
        "id": "alt-1",
        "timestamp": "15 mins ago",
        "title": "FASTag Alert: Scorpio UP14 AB 1234 on Yamuna Expressway",
        "description": (
            "Vehicle crossed Jewar toll plaza at 19:15 IST heading towards Lucknow. "
            "Associated with Amit Yadav. Requires human review."
        ),
        "level": "CRITICAL",
        "source": "FASTag ANPR",
        "related_entity_id": "ent-2",
        "related_entity_name": "Amit Yadav (UP14 AB 1234)",
        "city": "Noida / Greater Noida",
        "confidence": 94,
        "is_read": False
    },
    {
        "id": "alt-2",
        "timestamp": "45 mins ago",
        "title": "Banking Anomaly: ₹12,50,000 Structured Transfers",
        "description": (
            "Canara Bank Hazratganj branch flagged structured RTGS transactions linked with Priya Singh. "
            "Requires human review."
        ),
        "level": "HIGH",
        "source": "BANK / UPI FLAGGED",
        "related_entity_id": "ent-3",
        "related_entity_name": "Priya Singh",
        "city": "Lucknow",
        "confidence": 91,
        "is_read": False
    },
    {
        "id": "alt-3",
        "timestamp": "2 hours ago",
        "title": "Telecom Cluster: 36 Calls on Mirzapur-Ghaziabad Corridor",
        "description": (
            "Correlated call burst between +91 97XXXXXX45 and +91 96XXXXXX33. "
            "Requires human review."
        ),
        "level": "ELEVATED",
        "source": "CDR CLUSTER",
        "related_entity_id": "ent-5",
        "related_entity_name": "Neha Gupta",
        "city": "Mirzapur",
        "confidence": 88,
        "is_read": True
    }
]

# 6. Core Dashboard Metrics
SYNTHETIC_METRICS = [
    {
        "id": "m-1",
        "title": "Tracked Profiles of Interest",
        "value": "7 Entities",
        "change": "5 Priority Individuals",
        "trend": "neutral",
        "threat": "critical",
        "subtext": "Monitored across Delhi NCR and UP Corridor",
        "sparkline": [5, 6, 6, 7, 7, 7, 7]
    },
    {
        "id": "m-2",
        "title": "Monitored Locations",
        "value": "5 Cities",
        "change": "Delhi, Ghaziabad, Noida, Lucknow, Mirzapur",
        "trend": "neutral",
        "threat": "high",
        "subtext": "Active transit and financial nodes",
        "sparkline": [3, 4, 4, 5, 5, 5, 5]
    },
    {
        "id": "m-3",
        "title": "Correlated Connections",
        "value": "10 Relationships",
        "change": "Layered Transfers & Transit Links",
        "trend": "up",
        "threat": "high",
        "subtext": "Computed via NetworkX graph engine",
        "sparkline": [4, 6, 7, 8, 9, 10, 10]
    },
    {
        "id": "m-4",
        "title": "Algorithmic Pattern Matches",
        "value": "2 Possible Patterns",
        "change": "High Confidence Match",
        "trend": "up",
        "threat": "critical",
        "subtext": "Requires human analyst validation",
        "sparkline": [1, 1, 1, 2, 2, 2, 2]
    }
]

# 7. 3 Synthetic Evidence Records (TXT, CSV, JSON)
SYNTHETIC_EVIDENCE = [
    {
        "id": "ev-1",
        "evidence_number": "EV-2026-CDR-01",
        "case_id": "case-sih-01",
        "case_name": "Operation Chakravyuh",
        "title": "CDR Telecom Relay Summary (Delhi - Ghaziabad)",
        "type": "txt",
        "classification": "LAW ENFORCEMENT SENSITIVE",
        "date_collected": "2026-09-07 22:30 IST",
        "collected_by": "Inspector R. K. Sharma",
        "badge_number": "DL-SPL-4412",
        "location": "Indirapuram Cell Node 04, Ghaziabad",
        "city": "Ghaziabad",
        "hash_sha256": "8f72ac038b55e1b12d5929656209ef5a84ee66b4f74d081bc55c8297b4831201",
        "ai_summary": (
            "Synthetic text log: 36 short-duration calls recorded between +91 97XXXXXX45 and +91 96XXXXXX33. "
            "Indicates communications link requiring human review."
        ),
        "ai_extraction_tags": ["36 Calls Logged", "Delhi-Ghaziabad Handover", "+91 97XXXXXX45", "+91 96XXXXXX33"],
        "linked_entity_ids": ["ent-1", "ent-2", "ent-5"],
        "phone_ref": "+91 97XXXXXX45",
        "file_details": {
            "filename": "CDR_TOWER_DEL_GZB_SYNTH.txt",
            "size": "42 KB",
            "format": "Text/Plain"
        },
        "dataset_label": SYNTHETIC_DATASET_LABEL
    },
    {
        "id": "ev-2",
        "evidence_number": "EV-2026-FASTAG-02",
        "case_id": "case-sih-01",
        "case_name": "Operation Chakravyuh",
        "title": "Jewar Toll Plaza FASTag ANPR Capture Log",
        "type": "csv",
        "classification": "LAW ENFORCEMENT SENSITIVE",
        "date_collected": "2026-09-07 19:15 IST",
        "collected_by": "Inspector Rajesh Malik",
        "badge_number": "UP-STF-9910",
        "location": "Jewar Toll Plaza, Yamuna Expressway",
        "city": "Noida",
        "hash_sha256": "3e4c022f46e896472d0012d98f7e6f8b1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e",
        "ai_summary": (
            "Synthetic CSV log: Vehicle UP14 AB 1234 recorded crossing Jewar Toll Plaza heading towards Lucknow. "
            "Matches highway transit correlation pattern."
        ),
        "ai_extraction_tags": ["UP14 AB 1234", "Jewar Toll Plaza", "Yamuna Expressway", "Transit Pattern"],
        "linked_entity_ids": ["ent-2", "ent-4", "ent-v1"],
        "vehicle_ref": "UP14 AB 1234",
        "file_details": {
            "filename": "FASTAG_JEWAR_LOGS_SYNTH.csv",
            "size": "18 KB",
            "format": "CSV/Text"
        },
        "dataset_label": SYNTHETIC_DATASET_LABEL
    },
    {
        "id": "ev-3",
        "evidence_number": "EV-2026-BANK-03",
        "case_id": "case-sih-01",
        "case_name": "Operation Chakravyuh",
        "title": "Hazratganj Branch Ledger Extract",
        "type": "json",
        "classification": "CONFIDENTIAL",
        "date_collected": "2026-09-06 14:00 IST",
        "collected_by": "Special Auditor V. K. Nair",
        "badge_number": "ED-DEL-1029",
        "location": "Hazratganj Branch, Lucknow",
        "city": "Lucknow",
        "hash_sha256": "9b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
        "ai_summary": (
            "Synthetic JSON ledger: Structured transactions totaling ₹12,50,000 received into account #0492. "
            "Flagged for human auditor review."
        ),
        "ai_extraction_tags": ["₹12,50,000", "Structured Deposit", "Canara Bank #0492", "Priya Singh"],
        "linked_entity_ids": ["ent-1", "ent-2", "ent-3", "ent-b1"],
        "amount_inr": "₹12,50,000",
        "file_details": {
            "filename": "HAZRATGANJ_LEDGER_SYNTH.json",
            "size": "8.5 KB",
            "format": "JSON"
        },
        "dataset_label": SYNTHETIC_DATASET_LABEL
    }
]
