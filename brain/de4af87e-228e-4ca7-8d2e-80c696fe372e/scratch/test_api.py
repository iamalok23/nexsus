from __future__ import annotations

import sys
from pathlib import Path

# Add scratch to sys.path
sys.path.insert(0, str(Path(__file__).parent))

from fastapi.testclient import TestClient
from main import app, LEO_USERS

client = TestClient(app)


def test_cors():
    print("Testing CORS Middleware...")
    headers = {
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "X-Auth-Token",
    }
    response = client.options("/api/network", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173" or response.headers.get("access-control-allow-origin") == "*"
    print("  CORS verified successfully!")


def test_auth_and_rbac_network():
    print("Testing Authentication and RBAC on /api/network...")
    
    # 1. Missing header -> 401
    res = client.get("/api/network")
    assert res.status_code == 401, f"Expected 401, got {res.status_code}"

    # 2. Invalid token -> 401
    res = client.get("/api/network", headers={"X-Auth-Token": "bogus-token-000"})
    assert res.status_code == 401, f"Expected 401, got {res.status_code}"

    # 3. Valid token, but non-investigator role (analyst) -> 403
    res = client.get("/api/network", headers={"X-Auth-Token": "token-analyst-01"})
    assert res.status_code == 403, f"Expected 403, got {res.status_code}"
    assert "clearance" in res.json()["detail"].lower() or "forbidden" in res.json()["detail"].lower()

    # 4. Valid token, viewer role -> 403
    res = client.get("/api/network", headers={"X-Auth-Token": "token-viewer-01"})
    assert res.status_code == 403, f"Expected 403, got {res.status_code}"

    # 5. Valid token, investigator role -> 200
    res = client.get("/api/network", headers={"X-Auth-Token": "token-investigator-01"})
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert "elements" in data
    assert len(data["elements"]) > 0

    # Verify Cytoscape formatting: array of elements where each has a data dict containing id, source, target, and label
    for el in data["elements"]:
        assert "data" in el, "Missing 'data' dict in Cytoscape element"
        d = el["data"]
        assert "id" in d, "Element data missing 'id'"
        assert "label" in d, "Element data missing 'label'"
        if "source" in d:
            assert "target" in d, "Edge data has source but missing target"

    print("  /api/network RBAC and Cytoscape format verified successfully!")


def test_auth_and_rbac_anomalies():
    print("Testing Authentication and RBAC on /api/anomalies...")

    # 1. Missing header -> 401
    res = client.get("/api/anomalies")
    assert res.status_code == 401

    # 2. Non-investigator -> 403
    res = client.get("/api/anomalies", headers={"X-Auth-Token": "token-analyst-01"})
    assert res.status_code == 403

    # 3. Investigator -> 200
    res = client.get("/api/anomalies", headers={"X-Auth-Token": "token-investigator-02"})
    assert res.status_code == 200
    anomalies = res.json()
    assert isinstance(anomalies, list)
    assert len(anomalies) > 0

    # Verify anomaly schema
    for item in anomalies:
        assert "type" in item, "Missing 'type' in anomaly"
        assert "severity" in item, "Missing 'severity' in anomaly"
        assert "entities" in item, "Missing 'entities' in anomaly"
        assert isinstance(item["entities"], list)

    print("  /api/anomalies verified successfully!")


if __name__ == "__main__":
    test_cors()
    test_auth_and_rbac_network()
    test_auth_and_rbac_anomalies()
    print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY!")
