# Walkthrough - NEXUS Prototype Backend

We have built the backend prototype for the **NEXUS** law enforcement and intelligence analytics platform alongside the React/Vite frontend.

---

## 1. Accomplishments

### Architecture & Ethical Compliance
- **Strictly Synthetic Indian Dataset**: Fictional case `"Operation Chakravyuh"` featuring 7 entities (Rahul Verma, Amit Yadav, Priya Singh, Suresh Sharma, Neha Gupta, Scorpio UP14 AB 1234, Canara Bank Account #0492), 10 relationships, 2 possible patterns, and 3 evidence records.
- **Ethical Terminology**: No individual is labeled a "criminal". Used neutral language (`subject_of_interest`, `requires human review`, `possible pattern`, `risk indicator`).
- **Database**: Configured lightweight **SQLite** (`sqlite:///./nexus.db`) with SQLAlchemy 2.0 declarative models (`CaseModel`, `EntityModel`, `EvidenceModel`).
- **Graph Engine**: Integrated **NetworkX** to compute topological graph metrics (`degree`, `degree_centrality`, `betweenness_centrality`, `clustering_coefficient`, `density`).
- **Modular Extraction Service**: Architected `extraction_service.py` with `BaseExtractionService` for seamless drop-in upgrades to spaCy NER and Google Gemini API.
- **CORS & Documentation**: Configured CORS for the React frontend (`http://localhost:5173`, `http://localhost:3000`) and interactive Swagger UI (`/docs`) and ReDoc (`/redoc`).

---

## 2. API Endpoints Created

| Method | Path | Summary | Schema / Output |
|:---|:---|:---|:---|
| `GET` | `/health` | Service health check & dataset attribution | `HealthResponse` |
| `GET` | `/api/cases` | List cases with status/priority/search filters | `List[CaseResponse]` |
| `GET` | `/api/cases/{case_id}` | Retrieve case details | `CaseResponse` |
| `POST` | `/api/cases` | Create a new case in registry | `CaseResponse` (201 Created) |
| `GET` | `/api/network/{case_id}` | Case network graph powered by NetworkX | `NetworkGraphData` |
| `GET` | `/api/entities/{entity_id}` | Retrieve subject profile & indicators | `EntityResponse` |
| `GET` | `/api/insights/{case_id}` | AI crime patterns, threat alerts, metrics | `CaseInsightsResponse` |
| `POST` | `/api/upload` | Ingest evidence file (TXT, CSV, JSON only) | `UploadResponse` (201 Created) |

---

## 3. Verification & Test Results

Two automated test suites were built and executed against the FastAPI application:

### Phase 1 Test Suite (`backend/tests/test_phase1.py`)
```
--- RUNNING PHASE 1 ENDPOINT TESTS ---
PASS: test_health_endpoint
PASS: test_list_cases_endpoint (Found 1 cases)
PASS: test_get_case_detail_endpoint
PASS: test_get_case_not_found
PASS: test_create_case_endpoint (Created case ID: case-02)
PASS: test_network_graph_with_networkx (7 nodes, 10 edges, density=0.4762)
PASS: test_get_entity_detail (Verified ent-1 and ent-v1)
PASS: test_get_entity_not_found
PASS: test_insights_endpoint (2 patterns, 3 alerts, 4 metrics)
PASS: test_cors_headers (Allowed origin http://localhost:5173)
--- ALL PHASE 1 TESTS PASSED SUCCESSFULLY! ---
```

### Phase 2 Test Suite (`backend/tests/test_upload.py`)
```
--- RUNNING UPLOAD ENDPOINT TESTS ---
PASS: test_upload_txt_file (SHA256: 357698f09d32d55c...)
PASS: test_upload_csv_file
PASS: test_upload_json_file
PASS: test_upload_unsupported_file (Properly rejected PDF)
--- ALL UPLOAD TESTS PASSED SUCCESSFULLY! ---
```

---

## 4. Live Hosting & Access

Both backend and frontend servers are actively running concurrently in background tasks:

### Frontend (React + Vite + Tailwind CSS)
- **Local URL**: [http://localhost:5173](http://localhost:5173/)
- **Network URL**: `http://10.11.0.186:5173/`
- **Build Status**: Verified (`npm run build` exits 0, Tailwind CSS bundle 35.72 kB)
- **HTTP Status**: `200 OK`

### Backend (FastAPI + SQLite + NetworkX)
- **Local URL**: [http://localhost:8000](http://localhost:8000/)
- **Interactive OpenAPI Documentation (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Alternative Documentation (ReDoc)**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)
- **Cases API**: [http://localhost:8000/api/cases](http://localhost:8000/api/cases)
- **HTTP Status**: `200 OK`
