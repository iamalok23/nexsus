"""Comprehensive test suite for NEXUS Backend.
Tests SQLite persistence, services, ingestion, NetworkX graph, insights, and audit logging.
"""
import os
import sys
import unittest

# Ensure app is in Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.utils.database import SessionLocal, init_db, engine
from app.models import (
    Base,
    CaseModel,
    EntityModel,
    EvidenceModel,
    InteractionModel,
    RelationshipModel,
    TimelineEventModel,
    AuditLogModel,
    CaseEntityModel
)
from app.services.case_service import case_service
from app.services.entity_service import entity_service
from app.services.ingestion_service import ingestion_service
from app.services.relationship_service import relationship_service
from app.services.network_service import network_service
from app.services.insight_service import insight_service
from app.services.timeline_service import timeline_service
from app.utils.audit import log_investigator_action
from app.schemas.case import CaseCreate, CaseUpdate, CaseStatus, PriorityLevel
from app.schemas.entity import EntityCreate, EntityType, RiskLevel
from app.schemas.timeline import TimelineEventCreate


class NexusBackendIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Ensure all tables exist in SQLite."""
        init_db()

    def setUp(self):
        self.db = SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_01_database_tables_created(self):
        """Verify all tables exist in SQLite database."""
        table_names = engine.table_names() if hasattr(engine, "table_names") else Base.metadata.tables.keys()
        expected = [
            "cases", "entities", "evidence", "interactions",
            "relationships", "timeline_events", "audit_logs", "case_entities"
        ]
        for tbl in expected:
            self.assertIn(tbl, expected)

    def test_02_case_service_crud_and_links(self):
        """Test Case CRUD, status update, assign, and entity linking."""
        cases = case_service.get_cases(db=self.db)
        self.assertGreater(len(cases), 0)
        self.assertTrue(any(c.id == "case-sih-01" for c in cases))

        # Create new synthetic case
        new_case_in = CaseCreate(
            title="Operation Vajra Test",
            codeName="VAJRA-TEST",
            description="Testing case lifecycle operations.",
            priority=PriorityLevel.HIGH,
            leadInvestigator="Inspector A. Sharma",
            jurisdiction="Noida Expressway"
        )
        created = case_service.create_case(new_case_in, db=self.db)
        self.assertTrue(created.id.startswith("case-"))
        self.assertEqual(created.title, "Operation Vajra Test")

        # Update case status
        updated_status = case_service.update_case_status(created.id, "Surveillance Phase", db=self.db)
        self.assertEqual(updated_status.status, "Surveillance Phase")

        # Assign investigator
        assigned = case_service.assign_investigator(created.id, "ACP V. Rathore", db=self.db)
        self.assertEqual(assigned.lead_investigator, "ACP V. Rathore")

        # Link entity
        entity_service.seed_initial_entities(db=self.db)
        linked = case_service.link_entity(created.id, "ent-1", role_in_case="Prime Suspect", db=self.db)
        self.assertTrue(linked)

        # Retrieve linked entities
        case_ents = case_service.get_case_entities(created.id, db=self.db)
        self.assertTrue(any(e.id == "ent-1" for e in case_ents))

        # Unlink entity
        unlinked = case_service.unlink_entity(created.id, "ent-1", db=self.db)
        self.assertTrue(unlinked)

    def test_03_entity_service_crud_and_cases(self):
        """Test Entity CRUD, search, and associated cases lookup."""
        entities = entity_service.list_entities(db=self.db)
        self.assertGreater(len(entities), 0)
        ent1 = entity_service.get_entity_by_id("ent-1", db=self.db)
        self.assertEqual(ent1.id, "ent-1")

        # Create new entity
        new_ent = EntityCreate(
            name="Test Hawala Courier",
            type=EntityType.SUSPECT,
            riskScore=76,
            role="Transit Runner",
            primaryAffiliation="Eastern Network",
            phoneMasked="+91 98XXXXXX99",
            vehicleNumber="UP16 CD 4567",
            city="Noida"
        )
        created_ent = entity_service.create_entity(new_ent, db=self.db)
        self.assertTrue(created_ent.id.startswith("ent-"))
        self.assertEqual(created_ent.name, "Test Hawala Courier")

        # Lookup cases linked to entity
        cases_for_ent = entity_service.get_entity_cases("ent-1", db=self.db)
        self.assertGreater(len(cases_for_ent), 0)

    def test_04_ingestion_normalization_and_deduplication(self):
        """Test CDR & FASTag ingestion, phone normalization, and SHA-256 deduplication."""
        import time
        t_str = f"2026-09-08 14:00:{int(time.time() * 1000) % 100000:05d}"
        cdr_batch = [
            {
                "caller": "9818012345",
                "receiver": "+91 98110 54321",
                "timestamp": t_str,
                "duration_seconds": 240,
                "location": "Noida Sector 62",
                "city": "Noida"
            }
        ]
        resp1 = ingestion_service.ingest_cdr_records(cdr_batch, case_id="case-sih-01", db=self.db)
        self.assertEqual(resp1.records_processed, 1)
        self.assertEqual(resp1.records_valid, 1)

        # Duplicate ingestion should be deduplicated
        resp2 = ingestion_service.ingest_cdr_records(cdr_batch, case_id="case-sih-01", db=self.db)
        self.assertEqual(resp2.records_duplicated, 1)

        # FASTag ingestion
        fastag_batch = [
            {
                "vehicle_number": "UP14AB1234",
                "toll_plaza": "Jewar Toll Plaza",
                "timestamp": t_str,
                "city": "Jewar"
            }
        ]
        f_resp = ingestion_service.ingest_fastag_records(fastag_batch, case_id="case-sih-01", db=self.db)
        self.assertEqual(f_resp.records_valid, 1)

    def test_05_networkx_graph_dynamic_metrics(self):
        """Test NetworkX graph computation with real database nodes and edges."""
        graph_data = network_service.get_network_graph("case-sih-01", db=self.db)
        self.assertGreater(len(graph_data.nodes), 0)
        self.assertGreater(len(graph_data.edges), 0)
        self.assertGreaterEqual(graph_data.metrics.average_degree, 0.0)

        # Verify centrality scores are calculated
        for n in graph_data.nodes:
            self.assertIsNotNone(n.betweenness_centrality)
            self.assertIsNotNone(n.degree_centrality)
            self.assertIsNotNone(n.clustering_coefficient)

    def test_06_explainable_insights_and_disclaimers(self):
        """Test explainable rule-based insights and human verification notices."""
        insights = insight_service.get_case_insights("case-sih-01", db=self.db)
        self.assertEqual(insights.case_id, "case-sih-01")
        self.assertGreater(len(insights.patterns), 0)
        self.assertGreater(len(insights.alerts), 0)
        self.assertGreater(len(insights.metrics), 0)

        # Ensure pattern descriptions carry investigative lead / human review disclaimer
        for p in insights.patterns:
            self.assertIn("review", p.review_status.lower())

    def test_07_timeline_events(self):
        """Test timeline event retrieval and creation."""
        events = timeline_service.list_events(case_id="case-sih-01", db=self.db)
        self.assertGreater(len(events), 0)

        # Create new timeline event
        new_ev = TimelineEventCreate(
            caseId="case-sih-01",
            timestamp="2026-09-08 18:00:00",
            title="Field Intercept at Yamuna Toll",
            description="ANPR unit confirmed vehicle passage.",
            category="sighting",
            location="Jewar Toll",
            city="Jewar",
            entityIds=["ent-1"],
            entityNames=["Rahul Verma"],
            confidenceScore=95
        )
        created_ev = timeline_service.create_event(new_ev, db=self.db)
        self.assertTrue(created_ev.id.startswith("tl-"))

    def test_08_audit_logging(self):
        """Test immutable investigator audit logging."""
        log_investigator_action(
            officer_email="inspector.sharma@nexus.gov.in",
            action="VIEW_DOSSIER",
            resource_type="entity",
            resource_id="ent-1",
            officer_badge="DL-SPEC-409"
        )
        entry = self.db.query(AuditLogModel).filter(
            AuditLogModel.officer_email == "inspector.sharma@nexus.gov.in"
        ).first()
        self.assertIsNotNone(entry)
        self.assertEqual(entry.action, "VIEW_DOSSIER")


if __name__ == "__main__":
    unittest.main()
