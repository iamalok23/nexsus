# NEXUS Backend API (Synthetic Investigation Prototype)

A lightweight FastAPI backend prototype for the **NEXUS** law enforcement and intelligence analytics platform, built alongside the React/Vite frontend.

## Ethical AI & Synthetic Dataset Disclosure

> **IMPORTANT**:
> - All data in this backend is purely fictional and synthetically generated (`Synthetic Investigation Dataset`).
> - It contains **no real police files, criminal records, or personal identifying information**.
> - In accordance with ethical AI design, no individual is labeled a "criminal". All profiles are classified as `subject_of_interest` and all findings are designated as `possible pattern` or `risk indicator` requiring human analyst review.

---

## Technology Stack

* **Python**: 3.12+ (Tested on Python 3.14)
* **FastAPI**: Modern, high-performance web framework with automatic OpenAPI documentation (`/docs`, `/redoc`)
* **Pydantic v2**: Strict data validation, schema enforcement, and camelCase / snake_case aliasing
* **SQLAlchemy 2.0**: Declarative ORM models backed by **SQLite** (`nexus.db`)
* **NetworkX**: In-memory graph modeling and topological analysis (degree, degree centrality, betweenness centrality, clustering)
* **CORS**: Middleware configured for the React/Vite frontend (`http://localhost:5173`, `http://localhost:3000`)
* **Uvicorn**: Lightning-fast ASGI server

---

## Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # Application entrypoint, CORS, exception handlers, SQLite lifespan
│   ├── api/
│   │   ├── __init__.py
│   │   ├── router.py               # Central aggregator mounting all endpoints under /api
│   │   ├── health.py               # GET /health
│   │   ├── cases.py                # GET /api/cases, GET /api/cases/{case_id}, POST /api/cases
│   │   ├── network.py              # GET /api/network/{case_id} (NetworkX analysis)
│   │   ├── entities.py             # GET /api/entities, GET /api/entities/{entity_id}
│   │   ├── insights.py             # GET /api/insights/{case_id}
│   │   └── upload.py               # POST /api/upload (TXT, CSV, JSON only)
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py                 # SQLAlchemy 2.0 Base & TimestampMixin
│   │   ├── case.py                 # Case SQLite table
│   │   ├── entity.py               # Entity SQLite table
│   │   └── evidence.py             # Evidence SQLite table
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── common.py               # HealthResponse, ErrorDetail
│   │   ├── case.py                 # CaseCreate, CaseResponse, enums
│   │   ├── entity.py               # EntityResponse, EntityType, RiskLevel, LocationData
│   │   ├── network.py              # GraphNode, GraphEdge, NetworkGraphData, GraphMetrics
│   │   ├── insight.py              # CrimePattern, ThreatAlert, MetricData, CaseInsightsResponse
│   │   └── upload.py               # UploadResponse, FileDetails, ExtractedData
│   ├── services/
│   │   ├── __init__.py
│   │   ├── mock_data.py            # Synthetic Investigation Dataset (Operation Chakravyuh)
│   │   ├── case_service.py         # Case listing, detail, creation
│   │   ├── entity_service.py       # Subject profile lookup logic
│   │   ├── network_service.py      # NetworkX graph modeling & centrality metrics
│   │   ├── insight_service.py      # Pattern indicators, threat alerts, summary metrics
│   │   ├── extraction_service.py   # Modular extraction layer (stubbed for spaCy & Gemini API)
│   │   └── upload_service.py       # TXT/CSV/JSON file ingestion and SHA-256 calculation
│   └── utils/
│       ├── __init__.py
│       ├── config.py               # Pydantic BaseSettings (CORS origins, database URL)
│       ├── database.py             # SQLite engine & session factory
│       └── errors.py               # Structured HTTP exception handling
├── tests/
│   ├── test_phase1.py              # Automated tests for Phase 1 endpoints
│   └── test_upload.py              # Automated tests for Upload endpoint
├── requirements.txt                # Python dependencies
├── .env.example                    # Sample local environment variables
└── README.md                       # Documentation
```

---

## API Endpoints Catalog

| Method | Endpoint | Description | Request / Query | Response |
|:---|:---|:---|:---|:---|
| `GET` | `/health` | Service health status & dataset label | None | `HealthResponse` |
| `GET` | `/api/cases` | List all cases with optional filtering | `status`, `priority`, `search` | `List[CaseResponse]` |
| `GET` | `/api/cases/{case_id}` | Retrieve case by ID | `case_id: str` | `CaseResponse` |
| `POST` | `/api/cases` | Create a new investigation case | `CaseCreate` JSON body | `CaseResponse` (201) |
| `GET` | `/api/network/{case_id}` | Case network graph (NetworkX enriched) | `case_id: str`, `filter_type` | `NetworkGraphData` |
| `GET` | `/api/entities/{entity_id}` | Retrieve entity dossier and indicators | `entity_id: str` | `EntityResponse` |
| `GET` | `/api/insights/{case_id}` | AI crime patterns, threat alerts, metrics | `case_id: str` | `CaseInsightsResponse` |
| `POST` | `/api/upload` | Ingest evidence file (`.txt`, `.csv`, `.json`) | Multipart `file`, `case_id`, `title` | `UploadResponse` (201) |

Interactive documentation is available at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## NetworkX Integration

`app/services/network_service.py` builds an internal `networkx.Graph` representing the case entities and their relationships. It computes:
- Node degree (`dict(G.degree())`)
- Degree centrality (`nx.degree_centrality(G)`)
- Betweenness centrality (`nx.betweenness_centrality(G)`)
- Clustering coefficient (`nx.clustering(G)`)
- Graph density and average degree

These metrics are dynamically embedded into each `GraphNode` to support graph visualizations, node sizing, and influence detection on the frontend.

---

## Modular Extraction Architecture (`extraction_service.py`)

The prototype implements a `BaseExtractionService` abstract class:
```python
class BaseExtractionService(ABC):
    @abstractmethod
    def extract(self, content_text: str, filename: str, file_format: str) -> ExtractedData:
        pass
```
The active implementation `RuleBasedExtractionService` matches masked phone numbers (`+91 ...`), vehicle plates (`UP14 AB 1234`), and INR values (`₹...`).

### Upgrade Path
- **spaCy**: Replace/augment with an `SpacyExtractionService` using `en_core_web_trf` or `xx_ent_wiki_sm` for token-level entity extraction.
- **Gemini API**: Add a `GeminiExtractionService` calling the Gemini Interactions API (`google-genai`) with structured schema output (`response_schema=ExtractedData`) to perform semantic synthesis and context-aware pattern discovery.

---

## Getting Started

### 1. Installation
Activate your Python 3.12+ virtual environment and install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

### 2. Running the Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Running Automated Tests
```bash
python tests/test_phase1.py
python tests/test_upload.py
```
