"""Service layer for Case management with SQLite persistence."""
import copy
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.case import CaseModel
from app.models.case_entity import CaseEntityModel
from app.models.entity import EntityModel
from app.utils.database import SessionLocal
from app.services.mock_data import SYNTHETIC_CASES, SYNTHETIC_DATASET_LABEL
from app.schemas.case import CaseCreate, CaseUpdate, CaseResponse, CaseStatus
from app.schemas.entity import EntityResponse
from app.utils.errors import CaseNotFoundError, DatabaseOperationError


class CaseService:
    def __init__(self):
        pass

    def seed_initial_cases(self, db: Optional[Session] = None):
        """Seed initial synthetic case into SQLite if table is empty."""
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True
        try:
            if db.query(CaseModel).count() == 0:
                for c in SYNTHETIC_CASES:
                    case_obj = CaseModel(
                        id=c["id"],
                        case_number=c["case_number"],
                        title=c["title"],
                        code_name=c["code_name"],
                        description=c["description"],
                        status=c["status"],
                        priority=c["priority"],
                        lead_investigator=c["lead_investigator"],
                        agency=c["agency"],
                        jurisdiction=c["jurisdiction"],
                        opened_date=c["opened_date"],
                        last_updated=c["last_updated"],
                        warrants_issued=c.get("warrants_issued", 0),
                        assets_seized=c.get("assets_seized", "₹0"),
                        entities_count=c.get("entities_count", 0),
                        evidence_count=c.get("evidence_count", 0),
                        risk_index=c.get("risk_index", 50)
                    )
                    db.add(case_obj)
                db.commit()
        except Exception as e:
            db.rollback()
        finally:
            if close_db:
                db.close()

    def get_cases(
        self,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        search: Optional[str] = None,
        db: Optional[Session] = None
    ) -> List[CaseResponse]:
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True
        try:
            # Seed check
            if db.query(CaseModel).count() == 0:
                self.seed_initial_cases(db)

            query = db.query(CaseModel)
            if status and status.upper() != "ALL":
                query = query.filter(CaseModel.status.ilike(f"%{status}%"))
            if priority and priority.upper() != "ALL":
                query = query.filter(CaseModel.priority == priority.upper())
            if search and search.strip():
                q = f"%{search.strip()}%"
                query = query.filter(
                    or_(
                        CaseModel.title.ilike(q),
                        CaseModel.code_name.ilike(q),
                        CaseModel.description.ilike(q),
                        CaseModel.case_number.ilike(q),
                        CaseModel.lead_investigator.ilike(q)
                    )
                )

            records = query.order_by(CaseModel.created_at.desc()).all()
            return [
                CaseResponse(
                    id=r.id,
                    caseNumber=r.case_number,
                    title=r.title,
                    codeName=r.code_name,
                    description=r.description,
                    status=r.status,
                    priority=r.priority,
                    leadInvestigator=r.lead_investigator,
                    agency=r.agency,
                    jurisdiction=r.jurisdiction,
                    openedDate=r.opened_date,
                    lastUpdated=r.last_updated,
                    warrantsIssued=r.warrants_issued,
                    assetsSeized=r.assets_seized,
                    entitiesCount=r.entities_count,
                    evidenceCount=r.evidence_count,
                    riskIndex=r.risk_index,
                    dataset_label=SYNTHETIC_DATASET_LABEL
                )
                for r in records
            ]
        finally:
            if close_db:
                db.close()

    def get_case_by_id(self, case_id: str, db: Optional[Session] = None) -> CaseResponse:
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True
        try:
            # Seed check
            if db.query(CaseModel).count() == 0:
                self.seed_initial_cases(db)

            r = db.query(CaseModel).filter(CaseModel.id == case_id).first()
            if not r:
                raise CaseNotFoundError(case_id)

            return CaseResponse(
                id=r.id,
                caseNumber=r.case_number,
                title=r.title,
                codeName=r.code_name,
                description=r.description,
                status=r.status,
                priority=r.priority,
                leadInvestigator=r.lead_investigator,
                agency=r.agency,
                jurisdiction=r.jurisdiction,
                openedDate=r.opened_date,
                lastUpdated=r.last_updated,
                warrantsIssued=r.warrants_issued,
                assetsSeized=r.assets_seized,
                entitiesCount=r.entities_count,
                evidenceCount=r.evidence_count,
                riskIndex=r.risk_index,
                dataset_label=SYNTHETIC_DATASET_LABEL
            )
        finally:
            if close_db:
                db.close()

    def create_case(self, case_in: CaseCreate, db: Optional[Session] = None) -> CaseResponse:
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True
        try:
            now = datetime.now(timezone.utc).isoformat()
            total_cases = db.query(CaseModel).count()
            case_id = f"case-{total_cases + 1:02d}"
            case_num = case_in.case_number or f"CASE-2026-SYNTH-{total_cases + 1:02d}"

            case_obj = CaseModel(
                id=case_id,
                case_number=case_num,
                title=case_in.title,
                code_name=case_in.code_name,
                description=case_in.description,
                status=case_in.status.value if hasattr(case_in.status, "value") else str(case_in.status),
                priority=case_in.priority.value if hasattr(case_in.priority, "value") else str(case_in.priority),
                lead_investigator=case_in.lead_investigator,
                agency=case_in.agency,
                jurisdiction=case_in.jurisdiction,
                opened_date=now[:10],
                last_updated=now,
                warrants_issued=0,
                assets_seized="₹0",
                entities_count=0,
                evidence_count=0,
                risk_index=50
            )
            db.add(case_obj)
            db.commit()
            db.refresh(case_obj)

            return CaseResponse(
                id=case_obj.id,
                caseNumber=case_obj.case_number,
                title=case_obj.title,
                codeName=case_obj.code_name,
                description=case_obj.description,
                status=case_obj.status,
                priority=case_obj.priority,
                leadInvestigator=case_obj.lead_investigator,
                agency=case_obj.agency,
                jurisdiction=case_obj.jurisdiction,
                openedDate=case_obj.opened_date,
                lastUpdated=case_obj.last_updated,
                warrantsIssued=case_obj.warrants_issued,
                assetsSeized=case_obj.assets_seized,
                entitiesCount=case_obj.entities_count,
                evidenceCount=case_obj.evidence_count,
                riskIndex=case_obj.risk_index,
                dataset_label=SYNTHETIC_DATASET_LABEL
            )
        except Exception as e:
            db.rollback()
            raise DatabaseOperationError(f"Failed to create case in database: {str(e)}")
        finally:
            if close_db:
                db.close()

    def update_case(self, case_id: str, case_update: CaseUpdate, db: Optional[Session] = None) -> CaseResponse:
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True
        try:
            r = db.query(CaseModel).filter(CaseModel.id == case_id).first()
            if not r:
                raise CaseNotFoundError(case_id)

            now = datetime.now(timezone.utc).isoformat()
            if case_update.title is not None:
                r.title = case_update.title
            if case_update.description is not None:
                r.description = case_update.description
            if case_update.code_name is not None:
                r.code_name = case_update.code_name
            if case_update.priority is not None:
                r.priority = case_update.priority.value if hasattr(case_update.priority, "value") else str(case_update.priority)
            if case_update.lead_investigator is not None:
                r.lead_investigator = case_update.lead_investigator
            if case_update.agency is not None:
                r.agency = case_update.agency
            if case_update.jurisdiction is not None:
                r.jurisdiction = case_update.jurisdiction
            if case_update.status is not None:
                r.status = case_update.status.value if hasattr(case_update.status, "value") else str(case_update.status)

            r.last_updated = now
            db.commit()
            db.refresh(r)

            return CaseResponse(
                id=r.id,
                caseNumber=r.case_number,
                title=r.title,
                codeName=r.code_name,
                description=r.description,
                status=r.status,
                priority=r.priority,
                leadInvestigator=r.lead_investigator,
                agency=r.agency,
                jurisdiction=r.jurisdiction,
                openedDate=r.opened_date,
                lastUpdated=r.last_updated,
                warrantsIssued=r.warrants_issued,
                assetsSeized=r.assets_seized,
                entitiesCount=r.entities_count,
                evidenceCount=r.evidence_count,
                riskIndex=r.risk_index,
                dataset_label=SYNTHETIC_DATASET_LABEL
            )
        except CaseNotFoundError:
            raise
        except Exception as e:
            db.rollback()
            raise DatabaseOperationError(f"Failed to update case: {str(e)}")
        finally:
            if close_db:
                db.close()

    def update_case_status(self, case_id: str, new_status: str, db: Optional[Session] = None) -> CaseResponse:
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True
        try:
            r = db.query(CaseModel).filter(CaseModel.id == case_id).first()
            if not r:
                raise CaseNotFoundError(case_id)

            r.status = new_status
            r.last_updated = datetime.now(timezone.utc).isoformat()
            db.commit()
            db.refresh(r)

            return CaseResponse(
                id=r.id,
                caseNumber=r.case_number,
                title=r.title,
                codeName=r.code_name,
                description=r.description,
                status=r.status,
                priority=r.priority,
                leadInvestigator=r.lead_investigator,
                agency=r.agency,
                jurisdiction=r.jurisdiction,
                openedDate=r.opened_date,
                lastUpdated=r.last_updated,
                warrantsIssued=r.warrants_issued,
                assetsSeized=r.assets_seized,
                entitiesCount=r.entities_count,
                evidenceCount=r.evidence_count,
                riskIndex=r.risk_index,
                dataset_label=SYNTHETIC_DATASET_LABEL
            )
        finally:
            if close_db:
                db.close()

    def assign_investigator(self, case_id: str, lead_investigator: str, db: Optional[Session] = None) -> CaseResponse:
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True
        try:
            r = db.query(CaseModel).filter(CaseModel.id == case_id).first()
            if not r:
                raise CaseNotFoundError(case_id)

            r.lead_investigator = lead_investigator
            r.last_updated = datetime.now(timezone.utc).isoformat()
            db.commit()
            db.refresh(r)

            return CaseResponse(
                id=r.id,
                caseNumber=r.case_number,
                title=r.title,
                codeName=r.code_name,
                description=r.description,
                status=r.status,
                priority=r.priority,
                leadInvestigator=r.lead_investigator,
                agency=r.agency,
                jurisdiction=r.jurisdiction,
                openedDate=r.opened_date,
                lastUpdated=r.last_updated,
                warrantsIssued=r.warrants_issued,
                assetsSeized=r.assets_seized,
                entitiesCount=r.entities_count,
                evidenceCount=r.evidence_count,
                riskIndex=r.risk_index,
                dataset_label=SYNTHETIC_DATASET_LABEL
            )
        finally:
            if close_db:
                db.close()

    def link_entity(self, case_id: str, entity_id: str, role_in_case: str = "Subject of Interest", db: Optional[Session] = None):
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True
        try:
            existing = db.query(CaseEntityModel).filter(
                CaseEntityModel.case_id == case_id,
                CaseEntityModel.entity_id == entity_id
            ).first()
            if not existing:
                link_id = f"ce-{case_id}-{entity_id}"
                new_link = CaseEntityModel(
                    id=link_id,
                    case_id=case_id,
                    entity_id=entity_id,
                    role_in_case=role_in_case,
                    association_date=datetime.now(timezone.utc).isoformat()[:10]
                )
                db.add(new_link)
                # Update case entities count
                case_obj = db.query(CaseModel).filter(CaseModel.id == case_id).first()
                if case_obj:
                    case_obj.entities_count = db.query(CaseEntityModel).filter(CaseEntityModel.case_id == case_id).count() + 1
                    case_obj.last_updated = datetime.now(timezone.utc).isoformat()
                db.commit()
            return True
        finally:
            if close_db:
                db.close()

    def unlink_entity(self, case_id: str, entity_id: str, db: Optional[Session] = None):
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True
        try:
            db.query(CaseEntityModel).filter(
                CaseEntityModel.case_id == case_id,
                CaseEntityModel.entity_id == entity_id
            ).delete()
            case_obj = db.query(CaseModel).filter(CaseModel.id == case_id).first()
            if case_obj:
                case_obj.entities_count = db.query(CaseEntityModel).filter(CaseEntityModel.case_id == case_id).count()
                case_obj.last_updated = datetime.now(timezone.utc).isoformat()
            db.commit()
            return True
        finally:
            if close_db:
                db.close()

    def get_case_entities(self, case_id: str, db: Optional[Session] = None) -> List[EntityResponse]:
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True
        try:
            entity_ids = [r.entity_id for r in db.query(CaseEntityModel).filter(CaseEntityModel.case_id == case_id).all()]
            # If no explicit links yet, seed links for case-sih-01 with initial entities
            if not entity_ids and case_id == "case-sih-01":
                from app.services.entity_service import entity_service
                entity_service.seed_initial_entities(db)
                entities = db.query(EntityModel).all()
                for ent in entities:
                    self.link_entity(case_id, ent.id, role_in_case=ent.role or "Subject of Interest", db=db)
                entity_ids = [ent.id for ent in entities]

            matched_entities = db.query(EntityModel).filter(EntityModel.id.in_(entity_ids)).all()
            from app.services.entity_service import entity_service
            return [entity_service._model_to_response(e) for e in matched_entities]
        finally:
            if close_db:
                db.close()


# Singleton instance
case_service = CaseService()
