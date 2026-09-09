# Revised Implementation Plan - NEXUS Prototype Backend

A simple working prototype backend for the **NEXUS** investigation and intelligence analytics platform, built alongside the existing React/Vite frontend (`scratch/nexus/`) using Python 3.12+, FastAPI, Pydantic v2, SQLAlchemy 2.0 (SQLite), and NetworkX.

## Key Changes & Ethical Guidelines

> [!IMPORTANT]
> - **Synthetic Data Only**: Strictly fictional Indian investigation data. Clearly labeled as `"Synthetic Investigation Dataset"`. No real police records, criminal records, or personal data.
> - **Ethical Terminology**: No individual is ever labeled a "criminal" or "suspect". Instead, neutral analytical terms are used: `"subject_of_interest"`, `"risk indicator"`, `"requires human review"`, and `"possible pattern"`.
> - **Case Name & Scope**: Fictional case `"Operation Chakravyuh"` focused on inter-city logistics & transaction correlations across Delhi, Ghaziabad, Noida, Lucknow, and Mirzapur.
> - **Controlled Prototype Size**: 7 entities, 10 relationships, 2 possible patterns, and 3 evidence files.
> - **Graph Engine**: Explicitly integrates **NetworkX** to construct the case graph, compute degree and centrality metrics, and deliver enriched graph data to `/api/network/{case_id}`.
> - **Modular Extraction**: Creates a dedicated `extraction_service.py` to handle initial rule/mock extraction, designed for drop-in replacement with spaCy and Gemini API in future phases.
> - **Upload Restriction**: Restricted to **TXT, CSV, and JSON** files only.
> - **Staged Implementation**:
>   - **Phase 1**: Health, Cases, Network (NetworkX), Entity, and Insights endpoints + automated tests.
>   - **Phase 2**: File Upload endpoint (`POST /api/upload` for TXT/CSV/JSON) with `extraction_service.py` + tests.

---

## Revised Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI entrypoint, CORS (React frontend), docs & error handlers
│   ├── api/
│   │   ├── __init__.py
│   │   ├── router.py               # Aggregates /api sub-routers
│   │   ├── health.py               # GET /health
│   │   ├── cases.py                # GET /api/cases, GET /api/cases/{case_id}, POST /api/cases
│   │   ├── network.py              # GET /api/network/{case_id} (powered by NetworkX)
│   │   ├── entities.py             # GET /api/entities/{entity_id}
│   │   ├── insights.py             # GET /api/insights/{case_id}
│   │   └── upload.py               # POST /api/upload (Phase 2: TXT, CSV, JSON only)
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py                 # SQLAlchemy 2.0 DeclarativeBase
│   │   ├── case.py                 # CaseModel (SQLite table)
│   │   ├── entity.py               # EntityModel (SQLite table)
│   │   └── evidence.py             # EvidenceModel (SQLite table)
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── common.py               # HealthResponse, ErrorDetail, dataset label metadata
│   │   ├── case.py                 # CaseCreate, CaseResponse, CaseStatus, PriorityLevel
│   │   ├── entity.py               # EntityResponse, EntityType, RiskLevel, LocationData
│   │   ├── network.py              # GraphNode, GraphEdge, NetworkGraphData, GraphMetrics
│   │   ├── insight.py              # CrimePattern, ThreatAlert, MetricData, CaseInsightsResponse
│   │   └── upload.py               # UploadResponse, FileDetails (TXT, CSV, JSON)
│   ├── services/
│   │   ├── __init__.py
│   │   ├── mock_data.py            # "Synthetic Investigation Dataset" (Operation Chakravyuh)
│   │   ├── case_service.py         # Case listing, detail, creation
│   │   ├── entity_service.py       # Entity retrieval and profile lookups
│   │   ├── network_service.py      # NetworkX graph construction, degree/betweenness centrality
│   │   ├── insight_service.py      # Pattern indicators, threat alerts, summary metrics
│   │   ├── extraction_service.py   # Modular extraction layer (stubbed for spaCy/Gemini API upgrade)
│   │   └── upload_service.py       # TXT/CSV/JSON file ingestion and SHA-256 calculation (Phase 2)
│   └── utils/
│       ├── __init__.py
│       ├── config.py               # Settings (CORS origins: 5173, 3000, etc.)
│       ├── database.py             # SQLite engine (sqlite:///./nexus.db) & sessionmaker
│       └── errors.py               # Structured HTTP exception handling & formatting
├── requirements.txt                # FastAPI, Uvicorn, Pydantic, SQLAlchemy, NetworkX, python-multipart
├── .env.example                    # Local prototype env vars
└── README.md                       # API docs and quickstart instructions
```

---

## Synthetic Investigation Dataset Details ("Operation Chakravyuh")

All data is explicitly marked with `dataset: "Synthetic Investigation Dataset"`.

### 1. Entities (7 Core Entities)
- **ent-1 (Rahul Verma)**: Type: `subject_of_interest`, Risk: 88, Status: `Requires Human Review`, Affiliation: `Apex Logistics Front`, City: `Delhi`, Phone: `+91 98XXXXXX21`
- **ent-2 (Amit Yadav)**: Type: `subject_of_interest`, Risk: 82, Status: `Requires Human Review`, Affiliation: `Yadav Commercial Trading`, City: `Ghaziabad`, Phone: `+91 97XXXXXX45`
- **ent-3 (Priya Singh)**: Type: `subject_of_interest`, Risk: 78, Status: `Flagged Entity`, Affiliation: `Singh Overseas Consultancy`, City: `Noida`, Phone: `+91 99XXXXXX88`
- **ent-4 (Suresh Sharma)**: Type: `subject_of_interest`, Risk: 74, Status: `Under Review`, Affiliation: `National Freight Corridor`, City: `Lucknow`, Phone: `+91 88XXXXXX12`
- **ent-5 (Neha Gupta)**: Type: `subject_of_interest`, Risk: 69, Status: `Monitored Profile`, Affiliation: `Telecom Operations Auxiliary`, City: `Mirzapur`, Phone: `+91 96XXXXXX33`
- **ent-v1 (Scorpio UP14 AB 1234)**: Type: `vehicle`, Risk: 75, Status: `Tracked Asset`, City: `Noida / Yamuna Expressway`, Vehicle: `UP14 AB 1234`
- **ent-b1 (Bank Account #0492)**: Type: `bank_account`, Risk: 80, Status: `Flagged Account`, City: `Lucknow`, Branch: `Canara Bank Hazratganj`

### 2. Relationships (10 Connections)
1. `ent-1` ➔ `ent-2`: `financial_transfer` ("Informal Layered Transfer ₹12.5L", Amount: `₹12,50,000`, Suspicious: true, Weight: 8)
2. `ent-1` ➔ `ent-3`: `commercial_associate` ("Corporate Directorship Link", Suspicious: true, Weight: 7)
3. `ent-1` ➔ `ent-4`: `logistics_coordination` ("Consignment Escort Request", Suspicious: true, Weight: 6)
4. `ent-2` ➔ `ent-b1`: `banking_deposit` ("Structured Deposit ₹5.2L", Amount: `₹5,20,000`, Suspicious: true, Weight: 8)
5. `ent-3` ➔ `ent-b1`: `banking_withdrawal` ("Corporate Account Outflow ₹7.3L", Amount: `₹7,30,000`, Suspicious: true, Weight: 7)
6. `ent-2` ➔ `ent-v1`: `registered_keeper` ("Vehicle Registry Link", Suspicious: false, Weight: 5)
7. `ent-4` ➔ `ent-v1`: `transit_observation` ("Yamuna Expressway Transit Log", Suspicious: true, Weight: 6)
8. `ent-2` ➔ `ent-5`: `telecom_contact` ("Call Cluster (36 Calls)", Frequency: 36, Suspicious: true, Weight: 7)
9. `ent-1` ➔ `ent-5`: `telecom_contact` ("Direct Line Pings (4 Calls)", Frequency: 4, Suspicious: true, Weight: 5)
10. `ent-3` ➔ `ent-4`: `business_contact` ("Freight Clearance Documentation", Suspicious: false, Weight: 4)

### 3. Possible Patterns (2 Modus Operandi Findings)
1. **pat-1 ("Possible Layered Financial Pattern")**:
   - Category: `Financial Routing`
   - Confidence: 91%
   - Severity: `HIGH`
   - Description: "Sequential transfer of ₹12,50,000 originating in Delhi, routed via Ghaziabad trading account, and deposited into Lucknow commercial account within 6 hours. Requires human review."
   - Metric: `₹12,50,000 across 3 hops`
2. **pat-2 ("Possible Coordinated Highway Transit Pattern")**:
   - Category: `Transit Correlation`
   - Confidence: 86%
   - Severity: `ELEVATED`
   - Description: "Vehicle UP14 AB 1234 recorded crossing Jewar Toll Plaza on Yamuna Expressway, temporally correlated with cellular handovers between Noida and Lucknow corridors. Requires human review."
   - Metric: `Jewar Plaza toll handover`

### 4. Synthetic Evidence Files (3 Files)
1. `ev-1`: `CDR_TOWER_DEL_GZB_SYNTH.txt` (Text summary of telecom tower handovers between Delhi and Ghaziabad)
2. `ev-2`: `FASTAG_JEWAR_LOGS_SYNTH.csv` (CSV log of vehicle detections at Jewar Toll Plaza)
3. `ev-3`: `HAZRATGANJ_LEDGER_SYNTH.json` (Structured JSON bank transfer extract)

---

## NetworkX Integration Details

In `network_service.py`:
- Initialize a `networkx.Graph` populated with all mock nodes and edges.
- Compute topological graph metrics:
  - Degree centrality: `nx.degree_centrality(G)`
  - Betweenness centrality: `nx.betweenness_centrality(G)`
  - Node degrees: `dict(G.degree())`
  - Connected components / density
- Dynamically attach computed centrality, degree, and cluster indicators into each `GraphNode` before returning `NetworkGraphData` from `GET /api/network/{case_id}`.

---

## Modular Extraction Architecture (`extraction_service.py`)

`extraction_service.py` is isolated as an abstract processing interface:
```python
class BaseExtractionService(ABC):
    @abstractmethod
    async def extract_from_text(self, content: str, filename: str) -> ExtractedEntitiesResult:
        pass

class MockRuleExtractionService(BaseExtractionService):
    """
    Initial prototype implementation:
    Uses regex patterns to identify Indian phone numbers (+91), 
    vehicle numbers (e.g. UP14 AB 1234), and INR currency strings (₹...).
    Designed for seamless future upgrade to spaCy NER and Gemini API.
    """
```

---

## Staged Implementation & Verification Plan

### Phase 1: Core API & Graph Implementation (CURRENT)
1. Set up dependencies in `.venv` (`networkx`, `uvicorn`, `sqlalchemy`, `python-multipart`).
2. Scaffold `backend/` directory structure and SQLite database connection (`sqlite:///./nexus.db`).
3. Create Pydantic schemas and SQLAlchemy models adhering to ethical naming conventions.
4. Implement `mock_data.py` with the 7 entities, 10 relationships, 2 patterns, and 3 evidence records.
5. Implement `case_service.py`, `entity_service.py`, `network_service.py` (with NetworkX), and `insight_service.py`.
6. Implement endpoints:
   - `GET /health`
   - `GET /api/cases`
   - `GET /api/cases/{case_id}`
   - `POST /api/cases`
   - `GET /api/network/{case_id}` (NetworkX enriched)
   - `GET /api/entities/{entity_id}`
   - `GET /api/insights/{case_id}`
7. Configure CORS for React frontend (`localhost:5173`, `localhost:3000`).
8. Run automated tests with `httpx` / `pytest` to verify all Phase 1 endpoints return 200/201 and validated schemas.

### Phase 2: Evidence Upload & Extraction
1. Implement `extraction_service.py` and `upload_service.py`.
2. Restrict allowed upload MIME types and extensions to `.txt`, `.csv`, and `.json`.
3. Implement `POST /api/upload`.
4. Run integration tests uploading synthetic TXT, CSV, and JSON evidence files and verifying SHA-256 computation and extraction output.
