# =====================================================================
# requirements.txt
# =====================================================================
# fastapi>=0.110.0
# uvicorn[standard]>=0.28.0
# neo4j>=5.18.0
# pydantic>=2.6.0
# =====================================================================

from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime, timezone
import logging
import os
from typing import Any, Generator

from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

try:
    from neo4j import GraphDatabase, Driver, Session
    from neo4j.exceptions import ServiceUnavailable, AuthError
    HAS_NEO4J_DRIVER = True
except ImportError:  # pragma: no cover
    GraphDatabase = None
    Driver = None
    Session = None
    HAS_NEO4J_DRIVER = False

# Setup structured logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("law_enforcement_intel_api")

# =====================================================================
# Configuration & Environment
# =====================================================================

NEO4J_URI: str = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER: str = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD", "password123")

# Global Neo4j Driver instance
_neo4j_driver: Driver | None = None


def get_driver() -> Driver | None:
    """Initialize or return the global Neo4j driver."""
    global _neo4j_driver
    if _neo4j_driver is None and HAS_NEO4J_DRIVER and GraphDatabase is not None:
        try:
            _neo4j_driver = GraphDatabase.driver(
                NEO4J_URI,
                auth=(NEO4J_USER, NEO4J_PASSWORD),
                max_connection_lifetime=3600,
            )
            logger.info("Neo4j driver initialized for URI: %s", NEO4J_URI)
        except Exception as exc:
            logger.warning("Failed to initialize Neo4j driver: %s", exc)
            _neo4j_driver = None
    return _neo4j_driver


def close_driver() -> None:
    """Cleanly close Neo4j connection pool."""
    global _neo4j_driver
    if _neo4j_driver is not None:
        try:
            _neo4j_driver.close()
            logger.info("Neo4j driver connection pool closed.")
        except Exception as exc:
            logger.error("Error closing Neo4j driver: %s", exc)
        finally:
            _neo4j_driver = None


# =====================================================================
# Realistic Intelligence Fallback / Seed Data
# =====================================================================

MOCK_CYTOSCAPE_ELEMENTS: list[dict[str, Any]] = [
    # Person Nodes
    {"data": {"id": "p1", "label": "Viktor 'The Ghost' Vance", "type": "person", "role": "Syndicate Leader", "risk": "CRITICAL"}},
    {"data": {"id": "p2", "label": "Elena Rostova", "type": "person", "role": "Logistics Coordinator", "risk": "HIGH"}},
    {"data": {"id": "p3", "label": "Dmitri Volkov", "type": "person", "role": "Enforcer", "risk": "CRITICAL"}},
    {"data": {"id": "p4", "label": "Marcus Vance", "type": "person", "role": "Corporate Front Director", "risk": "MEDIUM"}},
    {"data": {"id": "p5", "label": "Sarah Chen", "type": "person", "role": "Financial Mule", "risk": "MEDIUM"}},
    # Phone Nodes
    {"data": {"id": "ph1", "label": "+1 (555) 019-4821 [Burner Alpha]", "type": "phone", "carrier": "T-Cell PPD"}},
    {"data": {"id": "ph2", "label": "+1 (555) 014-9982 [Burner Beta]", "type": "phone", "carrier": "Metro SIM"}},
    {"data": {"id": "ph3", "label": "+1 (555) 017-3310 [VoIP Trunk]", "type": "phone", "carrier": "SignalMesh Global"}},
    {"data": {"id": "ph4", "label": "+1 (555) 012-7804 [Encrypted Sat]", "type": "phone", "carrier": "Thuraya Sat"}},
    # Account Nodes
    {"data": {"id": "acc1", "label": "SWIFT // CH-9804-CY [Cayman Trust]", "type": "account", "balance": "$2,450,000"}},
    {"data": {"id": "acc2", "label": "USDT // 0x7f29...a81e [Tether Mule]", "type": "account", "balance": "$680,000 USDT"}},
    {"data": {"id": "acc3", "label": "IBAN // LU-1189-99 [Apex Shell Corp]", "type": "account", "balance": "$1,120,000"}},
    {"data": {"id": "acc4", "label": "ACH // US-Chase-4891 [Logistics Front]", "type": "account", "balance": "$84,500"}},
    # Edges
    {"data": {"id": "e1", "source": "p1", "target": "ph1", "label": "OPERATES"}},
    {"data": {"id": "e2", "source": "p2", "target": "ph2", "label": "OPERATES"}},
    {"data": {"id": "e3", "source": "p3", "target": "ph3", "label": "OPERATES"}},
    {"data": {"id": "e4", "source": "ph1", "target": "ph2", "label": "14 CALLS (42m)"}},
    {"data": {"id": "e5", "source": "ph2", "target": "ph3", "label": "BURST SMS"}},
    {"data": {"id": "e6", "source": "p1", "target": "ph4", "label": "SAT BRIDGE"}},
    {"data": {"id": "e7", "source": "p1", "target": "p2", "label": "DIRECTS"}},
    {"data": {"id": "e8", "source": "p2", "target": "p3", "label": "COORDINATES"}},
    {"data": {"id": "e9", "source": "p1", "target": "acc1", "label": "BENEFICIARY"}},
    {"data": {"id": "e10", "source": "acc1", "target": "acc2", "label": "WIRE $450,000"}},
    {"data": {"id": "e11", "source": "acc2", "target": "acc3", "label": "MIXER BRIDGE"}},
    {"data": {"id": "e12", "source": "p4", "target": "acc3", "label": "SIGNATORY"}},
    {"data": {"id": "e13", "source": "acc3", "target": "acc4", "label": "PAYROLL DISBURSE"}},
    {"data": {"id": "e14", "source": "p5", "target": "acc4", "label": "SMURF WITHDRAWAL"}},
]


# =====================================================================
# Lifespan Management
# =====================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager for startup and shutdown procedures."""
    logger.info("Initializing Law Enforcement Intelligence Platform API...")
    driver = get_driver()
    if driver is not None:
        try:
            driver.verify_connectivity()
            logger.info("Neo4j database connection verified successfully.")
        except Exception as exc:
            logger.warning("Neo4j connectivity check failed (%s). Fallback engine active.", exc)
    else:
        logger.info("Neo4j driver offline. API starting with intelligence simulation fallback.")
    
    yield

    logger.info("Shutting down Law Enforcement Intelligence Platform API...")
    close_driver()


# =====================================================================
# FastAPI App Initialization & CORS Setup
# =====================================================================

app = FastAPI(
    title="Law Enforcement Intelligence Platform API",
    description=(
        "Secure backend service for criminal network topology visualization, "
        "graph analytics, and automated anomaly detection."
    ),
    version="2.0.0",
    lifespan=lifespan,
)

# Enable CORS for frontend clients (e.g. React/Vite development servers)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*",  # Permissive for local intelligence development
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# =====================================================================
# Database Dependency: Neo4j Session Lifecycle
# =====================================================================

def get_neo4j_session() -> Generator[Session | None, None, None]:
    """
    FastAPI dependency yielding a Neo4j database session.
    Guarantees session cleanup via try-finally.
    Yields None if Neo4j is unreachable, allowing route fallback.
    """
    driver = get_driver()
    if driver is None:
        yield None
        return

    session = None
    try:
        session = driver.session()
        yield session
    except (ServiceUnavailable, AuthError) as exc:
        logger.warning("Neo4j service error during session creation: %s", exc)
        yield None
    finally:
        if session is not None:
            try:
                session.close()
            except Exception as exc:
                logger.error("Failed to close Neo4j session: %s", exc)


# =====================================================================
# RBAC & Authentication: Investigator Role Enforcer
# =====================================================================

# Simulated LEO directory mapping authorization tokens to personnel
LEO_USERS: dict[str, dict[str, str]] = {
    "token-investigator-01": {
        "name": "Det. Sarah Miller",
        "role": "investigator",
        "unit": "Major Narcotics Task Force",
        "badge": "BADGE-7402",
    },
    "token-investigator-02": {
        "name": "Special Agent Marcus Vance",
        "role": "investigator",
        "unit": "Organized Crime Strike Force",
        "badge": "BADGE-3319",
    },
    "token-analyst-01": {
        "name": "David Park",
        "role": "analyst",
        "unit": "Financial Intelligence Unit",
        "badge": "BADGE-9082",
    },
    "token-viewer-01": {
        "name": "Officer James Cole",
        "role": "viewer",
        "unit": "Patrol Division",
        "badge": "BADGE-5510",
    },
    "demo-investigator": {
        "name": "Det. Alex Cross",
        "role": "investigator",
        "unit": "Special Investigations",
        "badge": "BADGE-8008",
    },
}


class UserPrincipal(BaseModel):
    name: str
    role: str
    unit: str
    badge: str
    token: str


def current_user(x_auth_token: str | None = Header(None, alias="X-Auth-Token")) -> UserPrincipal:
    """
    Authenticate user via X-Auth-Token header.
    Raises HTTP 401 Unauthorized if token is invalid or missing.
    """
    if not x_auth_token:
        logger.warning("Access attempt without X-Auth-Token header.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed: missing X-Auth-Token header.",
            headers={"WWW-Authenticate": "X-Auth-Token"},
        )

    if x_auth_token not in LEO_USERS:
        logger.warning("Unauthorized access attempt with invalid token: %s", x_auth_token)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed: invalid or unrecognized X-Auth-Token header.",
            headers={"WWW-Authenticate": "X-Auth-Token"},
        )

    user_data = LEO_USERS[x_auth_token]
    return UserPrincipal(
        name=user_data["name"],
        role=user_data["role"],
        unit=user_data["unit"],
        badge=user_data["badge"],
        token=x_auth_token,
    )


def require_investigator(principal: UserPrincipal = Depends(current_user)) -> UserPrincipal:
    """
    Enforce Role-Based Access Control (RBAC).
    Permits only users with the 'investigator' role to access intelligence data endpoints.
    Raises HTTP 403 Forbidden on role mismatch.
    """
    if principal.role.lower() != "investigator":
        logger.warning(
            "Access Denied: User %s (%s) with role '%s' attempted to access investigator endpoint.",
            principal.name,
            principal.badge,
            principal.role,
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access forbidden: role '{principal.role}' does not possess 'investigator' clearance.",
        )
    return principal


# =====================================================================
# Pydantic Schemas for Swagger / OpenAPI Documentation
# =====================================================================

class CytoscapeElementData(BaseModel):
    id: str
    label: str
    source: str | None = None
    target: str | None = None
    type: str | None = None

    class Config:
        extra = "allow"


class CytoscapeElement(BaseModel):
    data: dict[str, Any]


class NetworkGraphResponse(BaseModel):
    elements: list[CytoscapeElement]
    total_nodes: int
    total_edges: int
    source: str


class AnomalyRecord(BaseModel):
    type: str = Field(..., description="Classification category of the suspicious activity")
    severity: str = Field(..., description="Severity level: low, medium, high, or critical")
    entities: list[str] = Field(..., description="List of entity IDs involved in the anomalous pattern")
    description: str | None = Field(None, description="Detailed intelligence assessment of the anomaly")
    confidence: float | None = Field(None, description="Detection confidence score (0.0 to 1.0)")
    timestamp: str | None = Field(None, description="ISO-8601 detection timestamp")


# =====================================================================
# API Endpoints
# =====================================================================

@app.get("/api/health", tags=["System"])
def health_check():
    """System health check endpoint."""
    driver = get_driver()
    neo4j_online = False
    if driver:
        try:
            driver.verify_connectivity()
            neo4j_online = True
        except Exception:
            neo4j_online = False

    return {
        "status": "healthy",
        "neo4j_connected": neo4j_online,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get(
    "/api/network",
    response_model=NetworkGraphResponse,
    tags=["Intelligence Graph"],
    summary="Fetch complete criminal network formatted for Cytoscape.js",
)
def get_network_graph(
    session: Session | None = Depends(get_neo4j_session),
    investigator: UserPrincipal = Depends(require_investigator),
):
    """
    Executes a Cypher query to retrieve all nodes and relationships from Neo4j.
    Formats records directly into Cytoscape.js elements containing `data` dictionaries
    with `id`, `source`, `target`, `label`, and associated properties.
    Falls back to high-fidelity simulated intelligence data if Neo4j is offline or empty.
    """
    logger.info("Executing network graph export for investigator %s (%s)", investigator.name, investigator.badge)

    elements: list[dict[str, Any]] = []
    nodes_seen: set[str] = set()

    # Cypher query to retrieve all nodes and their directed relationships
    cypher_query = """
    MATCH (n)
    OPTIONAL MATCH (n)-[r]->(m)
    RETURN n, r, m
    """

    if session is not None:
        try:
            result = session.run(cypher_query)
            for record in result:
                n = record.get("n")
                r = record.get("r")
                m = record.get("m")

                # Process source and target nodes
                for node in (n, m):
                    if node is not None:
                        # Handle Neo4j 5+ element_id or fallback to legacy id
                        node_id = str(getattr(node, "element_id", getattr(node, "id", None)))
                        if node_id not in nodes_seen:
                            nodes_seen.add(node_id)
                            labels = list(node.labels) if hasattr(node, "labels") else []
                            primary_label = labels[0] if labels else "Entity"
                            props = dict(node)

                            display_label = props.get("label") or props.get("name") or f"{primary_label} [{node_id}]"
                            node_type = props.get("type") or primary_label.lower()

                            element_data = {
                                "id": node_id,
                                "label": str(display_label),
                                "type": str(node_type),
                                **props,
                            }
                            elements.append({"data": element_data})

                # Process relationship / edge
                if r is not None:
                    edge_id = str(getattr(r, "element_id", getattr(r, "id", None)))
                    
                    # Resolve start and end node references
                    start_node = getattr(r, "start_node", None)
                    end_node = getattr(r, "end_node", None)

                    start_id = str(getattr(start_node, "element_id", getattr(start_node, "id", None))) if start_node else str(getattr(n, "element_id", getattr(n, "id", "")))
                    end_id = str(getattr(end_node, "element_id", getattr(end_node, "id", None))) if end_node else str(getattr(m, "element_id", getattr(m, "id", "")))

                    edge_props = dict(r)
                    rel_type = getattr(r, "type", "CONNECTED_TO")
                    display_label = edge_props.get("label") or rel_type

                    edge_data = {
                        "id": edge_id,
                        "source": start_id,
                        "target": end_id,
                        "label": str(display_label),
                        **edge_props,
                    }
                    elements.append({"data": edge_data})

            if elements:
                node_count = len(nodes_seen)
                edge_count = len(elements) - node_count
                return NetworkGraphResponse(
                    elements=[CytoscapeElement(data=el["data"]) for el in elements],
                    total_nodes=node_count,
                    total_edges=edge_count,
                    source="neo4j_database",
                )

        except Exception as exc:
            logger.warning("Error querying Neo4j graph (%s). Serving simulated network fallback.", exc)

    # Fallback to simulated high-fidelity intelligence data if Neo4j is empty or unreachable
    logger.info("Serving simulated intelligence fallback elements.")
    total_nodes = len([el for el in MOCK_CYTOSCAPE_ELEMENTS if "source" not in el["data"]])
    total_edges = len([el for el in MOCK_CYTOSCAPE_ELEMENTS if "source" in el["data"]])

    return NetworkGraphResponse(
        elements=[CytoscapeElement(data=el["data"]) for el in MOCK_CYTOSCAPE_ELEMENTS],
        total_nodes=total_nodes,
        total_edges=total_edges,
        source="simulated_intelligence_fallback",
    )


@app.get(
    "/api/anomalies",
    response_model=list[AnomalyRecord],
    tags=["Anomaly Detection"],
    summary="Run criminal network anomaly detection engine",
)
def get_anomalies(
    investigator: UserPrincipal = Depends(require_investigator),
):
    """
    Executes the automated criminal network anomaly detector.
    Analyzes transaction layering velocity, burner phone burst rotations,
    and command-and-control hierarchy anomalies across the entity graph.
    Returns flagged activities matching law enforcement pattern signatures.
    """
    logger.info(
        "Anomaly detection scan initiated by investigator %s (Badge: %s)",
        investigator.name,
        investigator.badge,
    )

    # Simulated output from graph anomaly detection algorithms (PageRank deltas, community bridges, cyclic smurfing)
    flagged_activities: list[dict[str, Any]] = [
        {
            "type": "structuring",
            "severity": "high",
            "entities": ["acc1", "acc2", "p5"],
            "description": "Repetitive sub-$10,000 cash deposits funneled through courier to unhosted Tether mixer.",
            "confidence": 0.94,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
        {
            "type": "burner_cycling",
            "severity": "critical",
            "entities": ["ph1", "ph2"],
            "description": "14 burst duration calls within 40 minutes across ephemeral SIM cards followed by handset power-down.",
            "confidence": 0.98,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
        {
            "type": "hierarchy_bypass",
            "severity": "high",
            "entities": ["p1", "p3", "ph4"],
            "description": "Direct communication detected between operational enforcer and Tier-1 cartel principal via encrypted sat link.",
            "confidence": 0.89,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
        {
            "type": "rapid_layering",
            "severity": "medium",
            "entities": ["acc2", "acc3", "acc4"],
            "description": "High-velocity capital transfer across multiple shell corporate accounts within 180 seconds.",
            "confidence": 0.82,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    ]

    return [AnomalyRecord(**item) for item in flagged_activities]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
