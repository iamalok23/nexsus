"""Service layer for Entity profiles with SQLite persistence."""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.entity import EntityModel
from app.models.case_entity import CaseEntityModel
from app.models.case import CaseModel
from app.utils.database import SessionLocal
from app.services.mock_data import SYNTHETIC_ENTITIES, SYNTHETIC_DATASET_LABEL
from app.schemas.entity import EntityResponse, EntityCreate, EntityUpdate, LocationData, EntityDetails, RiskLevel, EntityType
from app.schemas.case import CaseResponse
from app.utils.errors import EntityNotFoundError, DatabaseOperationError


class EntityService:
    def __init__(self):
        pass

    def seed_initial_entities(self, db: Optional[Session] = None):
        """Seed initial synthetic entities into SQLite if table is empty."""
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True
        try:
            if db.query(EntityModel).count() == 0:
                for e in SYNTHETIC_ENTITIES:
                    ent_obj = EntityModel(
                        id=e["id"],
                        name=e["name"],
                        type=e.get("type", "subject_of_interest"),
                        risk_score=e.get("risk_score", 50),
                        risk_level=e.get("risk_level", "ELEVATED"),
                        status=e.get("status", "Requires Human Review"),
                        aliases=e.get("aliases", []),
                        primary_affiliation=e.get("primary_affiliation", ""),
                        role=e.get("role", ""),
                        phone_masked=e.get("phone_masked"),
                        vehicle_number=e.get("vehicle_number"),
                        city=e.get("city", "Delhi"),
                        nationality=e.get("nationality", "Indian"),
                        photo=e.get("photo"),
                        last_known_location=e.get("last_known_location", {}),
                        tags=e.get("tags", []),
                        details=e.get("details", {})
                    )
                    db.add(ent_obj)
                db.commit()
        except Exception:
            db.rollback()
        finally:
            if close_db:
                db.close()

    def _model_to_response(self, r: EntityModel) -> EntityResponse:
        loc = r.last_known_location or {}
        loc_data = LocationData(
            name=loc.get("name", "Sector 18 Commercial Hub"),
            city=loc.get("city", r.city or "Delhi"),
            lat=loc.get("lat", 28.5708),
            lng=loc.get("lng", 77.3261),
            timestamp=loc.get("timestamp", "2026-09-07T12:00:00Z")
        ) if loc else None

        det = r.details or {}
        det_data = EntityDetails(
            knownAssociatesCount=det.get("known_associates_count") or det.get("knownAssociatesCount") or 0,
            totalFinancialFlow=det.get("total_financial_flow") or det.get("totalFinancialFlow") or "₹0",
            wiretapsCount=det.get("wiretaps_count") or det.get("wiretapsCount") or 0,
            dob=det.get("dob"),
            pob=det.get("pob"),
            wantedFor=det.get("wanted_for") or det.get("wantedFor")
        )

        risk_lvl = RiskLevel.CRITICAL if r.risk_score >= 85 else (RiskLevel.HIGH if r.risk_score >= 70 else RiskLevel.ELEVATED)
        ent_type = EntityType(r.type) if r.type in EntityType._value2member_map_ else EntityType.SUBJECT_OF_INTEREST

        return EntityResponse(
            id=r.id,
            name=r.name,
            type=ent_type,
            riskScore=r.risk_score,
            riskLevel=risk_lvl,
            status=r.status,
            aliases=r.aliases or [],
            primaryAffiliation=r.primary_affiliation or "",
            role=r.role or "",
            phoneMasked=r.phone_masked,
            vehicleNumber=r.vehicle_number,
            city=r.city or "Delhi",
            nationality=r.nationality or "Indian",
            photo=r.photo,
            lastKnownLocation=loc_data,
            tags=r.tags or [],
            details=det_data,
            dataset_label=SYNTHETIC_DATASET_LABEL
        )

    def get_entity_by_id(self, entity_id: str, db: Optional[Session] = None) -> EntityResponse:
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True
        try:
            if db.query(EntityModel).count() == 0:
                self.seed_initial_entities(db)

            r = db.query(EntityModel).filter(EntityModel.id == entity_id).first()
            if not r:
                raise EntityNotFoundError(entity_id)
            return self._model_to_response(r)
        finally:
            if close_db:
                db.close()

    def list_entities(
        self,
        city: Optional[str] = None,
        search: Optional[str] = None,
        entity_type: Optional[str] = None,
        db: Optional[Session] = None
    ) -> List[EntityResponse]:
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True
        try:
            if db.query(EntityModel).count() == 0:
                self.seed_initial_entities(db)

            query = db.query(EntityModel)
            if city and city.strip():
                query = query.filter(EntityModel.city.ilike(f"%{city.strip()}%"))
            if entity_type and entity_type.strip():
                query = query.filter(EntityModel.type == entity_type.strip())
            if search and search.strip():
                q = f"%{search.strip()}%"
                query = query.filter(
                    or_(
                        EntityModel.name.ilike(q),
                        EntityModel.role.ilike(q),
                        EntityModel.primary_affiliation.ilike(q),
                        EntityModel.phone_masked.ilike(q),
                        EntityModel.vehicle_number.ilike(q),
                        EntityModel.city.ilike(q)
                    )
                )

            records = query.order_by(EntityModel.risk_score.desc()).all()
            return [self._model_to_response(r) for r in records]
        finally:
            if close_db:
                db.close()

    def create_entity(self, entity_in: EntityCreate, db: Optional[Session] = None) -> EntityResponse:
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True
        try:
            total_entities = db.query(EntityModel).count()
            entity_id = f"ent-{total_entities + 1}"

            risk_score = entity_in.risk_score
            risk_level = "CRITICAL" if risk_score >= 85 else ("HIGH" if risk_score >= 70 else "ELEVATED")

            loc_dict = entity_in.last_known_location.model_dump() if entity_in.last_known_location else {
                "name": f"{entity_in.city} Sector Center",
                "city": entity_in.city,
                "lat": 28.6139,
                "lng": 77.2090,
                "timestamp": "2026-09-08T12:00:00Z"
            }

            details_dict = entity_in.details.model_dump() if entity_in.details else {
                "knownAssociatesCount": 0,
                "totalFinancialFlow": "₹0",
                "wiretapsCount": 0
            }

            ent_obj = EntityModel(
                id=entity_id,
                name=entity_in.name,
                type=entity_in.type.value if hasattr(entity_in.type, "value") else str(entity_in.type),
                risk_score=risk_score,
                risk_level=risk_level,
                status=entity_in.status,
                aliases=entity_in.aliases,
                primary_affiliation=entity_in.primary_affiliation,
                role=entity_in.role,
                phone_masked=entity_in.phone_masked,
                vehicle_number=entity_in.vehicle_number,
                city=entity_in.city,
                nationality=entity_in.nationality or "Indian",
                photo=entity_in.photo,
                last_known_location=loc_dict,
                tags=entity_in.tags or ["Monitored Target"],
                details=details_dict
            )
            db.add(ent_obj)
            db.commit()
            db.refresh(ent_obj)

            return self._model_to_response(ent_obj)
        except Exception as e:
            db.rollback()
            raise DatabaseOperationError(f"Failed to create entity: {str(e)}")
        finally:
            if close_db:
                db.close()

    def update_entity(self, entity_id: str, entity_update: EntityUpdate, db: Optional[Session] = None) -> EntityResponse:
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True
        try:
            r = db.query(EntityModel).filter(EntityModel.id == entity_id).first()
            if not r:
                raise EntityNotFoundError(entity_id)

            if entity_update.name is not None:
                r.name = entity_update.name
            if entity_update.type is not None:
                r.type = entity_update.type.value if hasattr(entity_update.type, "value") else str(entity_update.type)
            if entity_update.risk_score is not None:
                r.risk_score = entity_update.risk_score
                r.risk_level = "CRITICAL" if r.risk_score >= 85 else ("HIGH" if r.risk_score >= 70 else "ELEVATED")
            if entity_update.status is not None:
                r.status = entity_update.status
            if entity_update.aliases is not None:
                r.aliases = entity_update.aliases
            if entity_update.primary_affiliation is not None:
                r.primary_affiliation = entity_update.primary_affiliation
            if entity_update.role is not None:
                r.role = entity_update.role
            if entity_update.phone_masked is not None:
                r.phone_masked = entity_update.phone_masked
            if entity_update.vehicle_number is not None:
                r.vehicle_number = entity_update.vehicle_number
            if entity_update.city is not None:
                r.city = entity_update.city
            if entity_update.photo is not None:
                r.photo = entity_update.photo
            if entity_update.tags is not None:
                r.tags = entity_update.tags
            if entity_update.last_known_location is not None:
                r.last_known_location = entity_update.last_known_location.model_dump()
            if entity_update.details is not None:
                r.details = entity_update.details.model_dump()

            db.commit()
            db.refresh(r)
            return self._model_to_response(r)
        except EntityNotFoundError:
            raise
        except Exception as e:
            db.rollback()
            raise DatabaseOperationError(f"Failed to update entity: {str(e)}")
        finally:
            if close_db:
                db.close()

    def delete_entity(self, entity_id: str, db: Optional[Session] = None):
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True
        try:
            r = db.query(EntityModel).filter(EntityModel.id == entity_id).first()
            if not r:
                raise EntityNotFoundError(entity_id)

            db.query(CaseEntityModel).filter(CaseEntityModel.entity_id == entity_id).delete()
            db.delete(r)
            db.commit()
            return True
        finally:
            if close_db:
                db.close()

    def get_entity_cases(self, entity_id: str, db: Optional[Session] = None) -> List[CaseResponse]:
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True
        try:
            case_ids = [r.case_id for r in db.query(CaseEntityModel).filter(CaseEntityModel.entity_id == entity_id).all()]
            # If empty and this is one of initial entities, link to case-sih-01
            if not case_ids:
                from app.services.case_service import case_service
                case_service.link_entity("case-sih-01", entity_id, db=db)
                case_ids = ["case-sih-01"]

            cases = db.query(CaseModel).filter(CaseModel.id.in_(case_ids)).all()
            from app.services.case_service import case_service
            return [
                CaseResponse(
                    id=c.id,
                    caseNumber=c.case_number,
                    title=c.title,
                    codeName=c.code_name,
                    description=c.description,
                    status=c.status,
                    priority=c.priority,
                    leadInvestigator=c.lead_investigator,
                    agency=c.agency,
                    jurisdiction=c.jurisdiction,
                    openedDate=c.opened_date,
                    lastUpdated=c.last_updated,
                    warrantsIssued=c.warrants_issued,
                    assetsSeized=c.assets_seized,
                    entitiesCount=c.entities_count,
                    evidenceCount=c.evidence_count,
                    riskIndex=c.risk_index,
                    dataset_label=SYNTHETIC_DATASET_LABEL
                )
                for c in cases
            ]
        finally:
            if close_db:
                db.close()


# Singleton instance
entity_service = EntityService()
