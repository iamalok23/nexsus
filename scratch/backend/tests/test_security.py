"""Automated Security & Authentication Test Suite.

Verifies:
1. Public health check (/health and /api/health) requires no authentication (200 OK).
2. All sensitive routes (/api/cases, /api/evidence, /api/network, /api/entities, /api/upload)
   reject unauthenticated requests with HTTP 401 Unauthorized.
3. Requests with invalid or unconfigured Bearer tokens fail closed with HTTP 401.
4. Requests with verified authentication claims succeed with HTTP 200/201.
"""
import sys
import os
import io

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.utils.auth import get_current_user


def test_public_health_endpoints():
    """Verify /health and /api/health are strictly public."""
    # Ensure no overrides are active
    app.dependency_overrides.clear()
    with TestClient(app) as client:
        res1 = client.get("/health")
        assert res1.status_code == 200, f"Expected 200 for /health, got {res1.status_code}"
        assert res1.json()["status"] == "healthy"

        res2 = client.get("/api/health")
        assert res2.status_code == 200, f"Expected 200 for /api/health, got {res2.status_code}"
        assert res2.json()["status"] == "healthy"
    print("PASS: Public health endpoints accessible without credentials.")


def test_unauthenticated_requests_rejected():
    """Verify sensitive endpoints fail closed with 401 when no token is supplied."""
    app.dependency_overrides.clear()
    endpoints = [
        ("GET", "/api/cases"),
        ("GET", "/api/evidence"),
        ("GET", "/api/evidence/ev-1"),
        ("GET", "/api/entities"),
        ("GET", "/api/network/case-sih-01"),
        ("GET", "/api/insights/case-sih-01"),
        ("POST", "/api/upload"),
    ]

    with TestClient(app) as client:
        for method, url in endpoints:
            if method == "GET":
                res = client.get(url)
            else:
                res = client.post(url, files={"file": ("test.txt", io.BytesIO(b"test"), "text/plain")})

            assert res.status_code == 401, f"Expected 401 for {method} {url}, got {res.status_code}"
            assert res.json()["success"] is False
            assert "Missing authentication credentials" in res.json()["error"]["message"]
    print("PASS: All sensitive endpoints rejected with 401 Unauthorized when unauthenticated.")


def test_invalid_or_unconfigured_token_fails_closed():
    """Verify invalid token or missing server credentials fails closed with 401."""
    app.dependency_overrides.clear()
    with TestClient(app) as client:
        res = client.get("/api/cases", headers={"Authorization": "Bearer invalid.jwt.token"})
        assert res.status_code == 401, f"Expected 401, got {res.status_code}"
        assert res.json()["success"] is False
    print("PASS: Invalid token rejected securely.")


def test_authenticated_user_access_succeeds():
    """Verify that when Firebase credentials verify, protected endpoints succeed."""
    app.dependency_overrides[get_current_user] = lambda: {
        "uid": "officer-delhi-01",
        "email": "inspector.sharma@nexus.gov.in"
    }

    with TestClient(app) as client:
        res_cases = client.get("/api/cases")
        assert res_cases.status_code == 200
        assert len(res_cases.json()) >= 1

        res_evidence = client.get("/api/evidence")
        assert res_evidence.status_code == 200

        res_single = client.get("/api/evidence/ev-1")
        assert res_single.status_code == 200

        res_entities = client.get("/api/entities")
        assert res_entities.status_code == 200

    app.dependency_overrides.clear()
    print("PASS: Authenticated requests succeed across all endpoints.")


if __name__ == "__main__":
    test_public_health_endpoints()
    test_unauthenticated_requests_rejected()
    test_invalid_or_unconfigured_token_fails_closed()
    test_authenticated_user_access_succeeds()
    print("\nALL SECURITY TEST SUITES PASSED!")
