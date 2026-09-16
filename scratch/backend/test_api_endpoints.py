"""FastAPI HTTP API router endpoint testing.
Validates public health endpoints, 401 unauthenticated rejects, and authenticated access.
"""
import os
import sys
import unittest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.utils.auth import get_current_user

client = TestClient(app)


class ApiEndpointTests(unittest.TestCase):
    def test_01_public_health_endpoints(self):
        """Verify /health and /api/health are accessible without token."""
        res1 = client.get("/health")
        self.assertEqual(res1.status_code, 200)
        data1 = res1.json()
        self.assertEqual(data1["status"], "healthy")

        res2 = client.get("/api/health")
        self.assertEqual(res2.status_code, 200)

    def test_02_protected_endpoints_reject_unauthenticated(self):
        """Verify all protected API endpoints return 401 Unauthorized when token is missing."""
        protected_urls = [
            "/api/cases",
            "/api/cases/case-sih-01",
            "/api/entities",
            "/api/entities/ent-1",
            "/api/network/case-sih-01",
            "/api/insights/case-sih-01",
            "/api/evidence",
            "/api/timeline",
            "/api/ingest/stats"
        ]
        for url in protected_urls:
            res = client.get(url)
            self.assertEqual(
                res.status_code, 401,
                f"Endpoint {url} did not reject unauthenticated request, returned {res.status_code}"
            )

    def test_03_authenticated_access_via_dependency_override(self):
        """Verify endpoints return correct schemas when authenticated."""
        mock_user = {
            "uid": "test-inspector-01",
            "email": "inspector.sharma@nexus.gov.in",
            "name": "ACP Vikramaditya Rathore"
        }
        app.dependency_overrides[get_current_user] = lambda: mock_user

        try:
            # 1. Cases list
            res_cases = client.get("/api/cases")
            self.assertEqual(res_cases.status_code, 200)
            self.assertIsInstance(res_cases.json(), list)

            # 2. Case detail
            res_case = client.get("/api/cases/case-sih-01")
            self.assertEqual(res_case.status_code, 200)
            self.assertEqual(res_case.json()["id"], "case-sih-01")

            # 3. Entities
            res_entities = client.get("/api/entities")
            self.assertEqual(res_entities.status_code, 200)
            self.assertIsInstance(res_entities.json(), list)

            # 4. Network Graph (NetworkX)
            res_network = client.get("/api/network/case-sih-01")
            self.assertEqual(res_network.status_code, 200)
            net_data = res_network.json()
            self.assertIn("nodes", net_data)
            self.assertIn("edges", net_data)
            self.assertIn("metrics", net_data)

            # 5. Insights
            res_insights = client.get("/api/insights/case-sih-01")
            self.assertEqual(res_insights.status_code, 200)
            self.assertIn("patterns", res_insights.json())

            # 6. Timeline
            res_timeline = client.get("/api/timeline?case_id=case-sih-01")
            self.assertEqual(res_timeline.status_code, 200)
            self.assertIsInstance(res_timeline.json(), list)

            # 7. Ingest stats
            res_stats = client.get("/api/ingest/stats")
            self.assertEqual(res_stats.status_code, 200)
            self.assertEqual(res_stats.json()["status"], "active")

        finally:
            app.dependency_overrides.clear()


if __name__ == "__main__":
    unittest.main()
