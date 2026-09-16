"""Service layer for Investigation Timeline with SQLite persistence."""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.timeline import TimelineEventModel
from app.utils.database import SessionLocal
from app.schemas.timeline import TimelineEventResponse, TimelineEventCreate

INITIAL_TIMELINE_SEED = [
    {
        "id": "tl-1",
        "timestamp": "2026-09-05 23:45 IST",
        "title": "Intercepted Audio Comms - Delivery Directive",
        "description": "Rahul Verma directed Amit Yadav to disburse ₹45,000 cash advance to courier Anil Kumar in Kanpur.",
        "category": "wiretap",
        "entity_ids": ["ent-1", "ent-2", "ent-7"],
        "entity_names": ["Rahul Verma", "Amit Yadav", "Anil Kumar"],
        "case_id": "case-sih-01",
        "location": "Lodhi Road Cell Node, Delhi",
        "confidence_score": 92,
        "evidence_id": "EV-2026-VOICE-04"
    },
    {
        "id": "tl-2",
        "timestamp": "2026-09-06 14:00 IST",
        "title": "Flagged RTGS Transaction - Canara Bank",
        "description": "₹12,50,000 transferred via RTGS from bullion trader accounts into Priya Singh linked entity in Lucknow.",
        "category": "financial",
        "entity_ids": ["ent-1", "ent-2", "ent-3"],
        "entity_names": ["Rahul Verma", "Amit Yadav", "Priya Singh"],
        "case_id": "case-sih-01",
        "location": "Hazratganj, Lucknow",
        "confidence_score": 95,
        "evidence_id": "EV-2026-BANK-03"
    },
    {
        "id": "tl-3",
        "timestamp": "2026-09-07 19:15 IST",
        "title": "ANPR Toll Sighting - Scorpio UP14 AB 1234",
        "description": "Vehicle registered under Amit Yadav crossed Jewar Toll Plaza on Yamuna Expressway heading to Lucknow.",
        "category": "sighting",
        "entity_ids": ["ent-2", "ent-4"],
        "entity_names": ["Amit Yadav", "Suresh Sharma"],
        "case_id": "case-sih-01",
        "location": "Jewar Toll Plaza, Yamuna Expressway",
        "confidence_score": 98,
        "evidence_id": "EV-2026-FASTAG-02"
    },
    {
        "id": "tl-4",
        "timestamp": "2026-09-07 22:30 IST",
        "title": "Surveillance Raid & Warrant Issuance",
        "description": "Search warrant executed at Indirapuram cell location following 48 midnight calls between syndicate operatives.",
        "category": "warrant",
        "entity_ids": ["ent-1", "ent-2", "ent-5"],
        "entity_names": ["Rahul Verma", "Amit Yadav", "Neha Gupta"],
        "case_id": "case-sih-01",
        "location": "Indirapuram, Ghaziabad",
        "confidence_score": 94,
        "evidence_id": "EV-2026-CDR-01"
    }
]


class TimelineService:
    def seed_initial_timeline(self, db: Optional[Session] = None):
        """Seed default timeline events into SQLite if empty."""
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True
        try:
            if db.query(TimelineEventModel).count() == 0:
                for item in INITIAL_TIMELINE_SEED:
                    ev_obj = TimelineEventModel(
                        id=item["id"],
                        case_id=item["case_id"],
                        timestamp=item["timestamp"],
                        title=item["title"],
                        description=item["description"],
                        category=item["category"],
                        location=item["location"],
                        entity_ids=item["entity_ids"],
                        entity_names=item["entity_names"],
                        evidence_id=item["evidence_id"],
                        confidence_score=item["confidence_score"]
                    )
                    db.add(ev_obj)
                db.commit()
        except Exception:
            db.rollback()
        finally:
            if close_db:
                db.close()

    def list_events(
        self,
        case_id: Optional[str] = "case-sih-01",
        category: Optional[str] = None,
        entity_id: Optional[str] = None,
        search: Optional[str] = None,
        db: Optional[Session] = None
    ) -> List[TimelineEventResponse]:
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True
        try:
            if db.query(TimelineEventModel).count() == 0:
                self.seed_initial_timeline(db)

            query = db.query(TimelineEventModel)
            if case_id and case_id.upper() != "ALL":
                query = query.filter(TimelineEventModel.case_id == case_id)
            if category and category.upper() != "ALL":
                query = query.filter(TimelineEventModel.category.ilike(category))
            if search and search.strip():
                q = f"%{search.strip()}%"
                query = query.filter(
                    or_(
                        TimelineEventModel.title.ilike(q),
                        TimelineEventModel.description.ilike(q),
                        TimelineEventModel.location.ilike(q)
                    )
                )

            records = query.order_by(TimelineEventModel.timestamp.desc()).all()

            results = []
            for r in records:
                # Filter by entity_id if specified
                if entity_id and entity_id.upper() != "ALL":
                    e_ids = r.entity_ids or []
                    if entity_id not in e_ids:
                        continue

                results.append(
                    TimelineEventResponse(
                        id=r.id,
                        caseId=r.case_id,
                        timestamp=r.timestamp,
                        title=r.title,
                        description=r.description,
                        category=r.category,
                        location=r.location,
                        city=r.city,
                        entityIds=r.entity_ids or [],
                        entityNames=r.entity_names or [],
                        evidenceId=r.evidence_id,
                        confidenceScore=r.confidence_score,
                        sourceCitation=r.source_citation
                    )
                )
            return results
        finally:
            if close_db:
                db.close()

    def create_event(self, ev_in: TimelineEventCreate, db: Optional[Session] = None) -> TimelineEventResponse:
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True
        try:
            total = db.query(TimelineEventModel).count()
            ev_id = f"tl-{total + 1}"

            ev_obj = TimelineEventModel(
                id=ev_id,
                case_id=ev_in.case_id or "case-sih-01",
                timestamp=ev_in.timestamp,
                title=ev_in.title,
                description=ev_in.description,
                category=ev_in.category,
                location=ev_in.location,
                city=ev_in.city,
                entity_ids=ev_in.entity_ids,
                entity_names=ev_in.entity_names,
                evidence_id=ev_in.evidence_id,
                confidence_score=ev_in.confidence_score,
                source_citation=ev_in.source_citation
            )
            db.add(ev_obj)
            db.commit()
            db.refresh(ev_obj)

            return TimelineEventResponse(
                id=ev_obj.id,
                caseId=ev_obj.case_id,
                timestamp=ev_obj.timestamp,
                title=ev_obj.title,
                description=ev_obj.description,
                category=ev_obj.category,
                location=ev_obj.location,
                city=ev_obj.city,
                entityIds=ev_obj.entity_ids or [],
                entityNames=ev_obj.entity_names or [],
                evidenceId=ev_obj.evidence_id,
                confidenceScore=ev_obj.confidence_score,
                sourceCitation=ev_obj.source_citation
            )
        finally:
            if close_db:
                db.close()


timeline_service = TimelineService()
