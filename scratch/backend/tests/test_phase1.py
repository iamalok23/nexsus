"""Automated Test Suite for Phase 1 Backend Endpoints."""
import sys
import os

# Add backend directory to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.utils.auth import get_current_user

app.dependency_overrides[get_current_user] = lambda: {"uid": "test-officer", "email": "officer@nexus.gov.in"}
client = TestClient(app)


def test_health_endpoint():
    """Verify GET /health returns 200 with service info and dataset label."""
    response = client.get("/health")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["status"] == "healthy"
    assert "NEXUS" in data["service"]
    assert data["dataset"] == "Synthetic Investigation Dataset"
    print("PASS: test_health_endpoint")


def test_list_cases_endpoint():
    """Verify GET /api/cases returns the synthetic cases."""
    response = client.get("/api/cases")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    cases = response.json()
    assert isinstance(cases, list)
    assert len(cases) >= 1
    chakravyuh = next((c for c in cases if c["title"] == "Operation Chakravyuh"), None)
    assert chakravyuh is not None
    assert chakravyuh["id"] == "case-sih-01"
    assert chakravyuh["codeName"] == "CHAKRAVYUH"
    assert chakravyuh["dataset_label"] == "Synthetic Investigation Dataset"
    print(f"PASS: test_list_cases_endpoint (Found {len(cases)} cases)")


def test_get_case_detail_endpoint():
    """Verify GET /api/cases/{case_id} retrieves case details."""
    response = client.get("/api/cases/case-sih-01")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    case = response.json()
    assert case["id"] == "case-sih-01"
    assert case["leadInvestigator"] == "ACP Vikramaditya Rathore"
    assert case["jurisdiction"] == "Delhi NCR / Uttar Pradesh Crime Corridor"
    print("PASS: test_get_case_detail_endpoint")


def test_get_case_not_found():
    """Verify GET /api/cases/{invalid_id} returns 404 with structured error."""
    response = client.get("/api/cases/invalid-case-999")
    assert response.status_code == 404, f"Expected 404, got {response.status_code}"
    err = response.json()
    assert err["success"] is False
    assert err["error"]["type"] == "CaseNotFoundError"
    print("PASS: test_get_case_not_found")


def test_create_case_endpoint():
    """Verify POST /api/cases creates a new case."""
    payload = {
        "title": "Operation Garud",
        "description": "Synthetic NCR freight corridor tracking test.",
        "codeName": "GARUD",
        "priority": "HIGH",
        "leadInvestigator": "Inspector Rajiv Sen",
        "agency": "Delhi Police Special Unit",
        "jurisdiction": "Delhi - Ghaziabad"
    }
    response = client.post("/api/cases", json=payload)
    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
    new_case = response.json()
    assert new_case["title"] == "Operation Garud"
    assert new_case["codeName"] == "GARUD"
    assert new_case["dataset_label"] == "Synthetic Investigation Dataset"
    print(f"PASS: test_create_case_endpoint (Created case ID: {new_case['id']})")


def test_network_graph_with_networkx():
    """Verify GET /api/network/{case_id} returns NetworkX enriched graph data."""
    response = client.get("/api/network/case-sih-01")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    graph = response.json()
    assert graph["caseId"] == "case-sih-01"
    assert len(graph["nodes"]) >= 7, f"Expected at least 7 nodes, got {len(graph['nodes'])}"
    assert len(graph["edges"]) >= 10, f"Expected at least 10 edges, got {len(graph['edges'])}"

    # Verify NetworkX metrics
    metrics = graph["metrics"]
    assert metrics["nodeCount"] >= 7
    assert metrics["edgeCount"] >= 10
    assert "NetworkX 3.x" in metrics["analysis_engine"]
    assert metrics["density"] > 0
    assert metrics["averageDegree"] > 0

    # Verify individual node has NetworkX computed degree & betweenness centrality
    rahul = next(n for n in graph["nodes"] if n["id"] == "ent-1")
    assert rahul["label"] == "Rahul Verma"
    assert rahul["degree"] > 0
    assert "degreeCentrality" in rahul
    assert "betweennessCentrality" in rahul
    assert rahul["status"] == "Requires Human Review"
    print(f"PASS: test_network_graph_with_networkx ({metrics['nodeCount']} nodes, {metrics['edgeCount']} edges, density={metrics['density']})")


def test_get_entity_detail():
    """Verify GET /api/entities/{entity_id} retrieves entity details."""
    response = client.get("/api/entities/ent-1")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    ent = response.json()
    assert ent["id"] == "ent-1"
    assert ent["name"] == "Rahul Verma"
    assert ent["riskScore"] == 88
    assert ent["phoneMasked"] == "+91 98XXXXXX21"
    assert ent["city"] == "Delhi"
    assert ent["status"] == "Requires Human Review"
    assert ent["dataset_label"] == "Synthetic Investigation Dataset"

    # Test vehicle entity
    v_resp = client.get("/api/entities/ent-v1")
    assert v_resp.status_code == 200
    v_ent = v_resp.json()
    assert v_ent["vehicleNumber"] == "UP14 AB 1234"
    assert "Scorpio" in v_ent["name"]
    print("PASS: test_get_entity_detail (Verified ent-1 and ent-v1)")


def test_get_entity_not_found():
    """Verify GET /api/entities/{invalid_id} returns 404 with structured error."""
    response = client.get("/api/entities/invalid-ent-999")
    assert response.status_code == 404
    err = response.json()
    assert err["success"] is False
    assert err["error"]["type"] == "EntityNotFoundError"
    print("PASS: test_get_entity_not_found")


def test_insights_endpoint():
    """Verify GET /api/insights/{case_id} returns crime patterns, threat alerts, and metrics."""
    response = client.get("/api/insights/case-sih-01")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    insights = response.json()
    assert insights["caseId"] == "case-sih-01"
    assert len(insights["patterns"]) >= 2, f"Expected at least 2 patterns, got {len(insights['patterns'])}"
    assert len(insights["alerts"]) >= 2, f"Expected at least 2 alerts, got {len(insights['alerts'])}"
    assert len(insights["metrics"]) == 4, f"Expected 4 metrics, got {len(insights['metrics'])}"

    # Check pattern content
    assert any(p["reviewStatus"] == "Requires Human Review" for p in insights["patterns"])

    # Check alert content
    scorpio_alert = next((a for a in insights["alerts"] if "UP14 AB 1234" in a["title"] or "ANPR" in a["title"]), None)
    assert scorpio_alert is not None
    print(f"PASS: test_insights_endpoint ({len(insights['patterns'])} patterns, {len(insights['alerts'])} alerts, {len(insights['metrics'])} metrics)")


def test_cors_headers():
    """Verify CORS preflight or response headers allow React frontend on :5173."""
    response = client.options(
        "/api/cases",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET"
        }
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"
    print("PASS: test_cors_headers (Allowed origin http://localhost:5173)")


if __name__ == "__main__":
    print("--- RUNNING PHASE 1 ENDPOINT TESTS ---")
    test_health_endpoint()
    test_list_cases_endpoint()
    test_get_case_detail_endpoint()
    test_get_case_not_found()
    test_create_case_endpoint()
    test_network_graph_with_networkx()
    test_get_entity_detail()
    test_get_entity_not_found()
    test_insights_endpoint()
    test_cors_headers()
    print("--- ALL PHASE 1 TESTS PASSED SUCCESSFULLY! ---")
