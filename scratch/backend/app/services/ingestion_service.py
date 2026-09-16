"""Service layer for Data Ingestion, Normalization, Deduplication, and Linking."""
import re
import hashlib
import json
import csv
import io
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.interaction import InteractionModel
from app.models.entity import EntityModel
from app.models.timeline import TimelineEventModel
from app.utils.database import SessionLocal
from app.schemas.ingestion import IngestionResponse, CDRRecord, FASTagRecord, FinancialRecord
from app.services.relationship_service import relationship_service


class IngestionService:
    @staticmethod
    def normalize_phone(phone: str) -> str:
        """Normalize Indian telephone numbers into standardized masked or E.164-style strings."""
        if not phone:
            return ""
        clean = re.sub(r'[\s\-\(\)]', '', phone.strip())
        if clean.startswith('+91'):
            return clean
        if clean.startswith('91') and len(clean) == 12:
            return f"+{clean}"
        if len(clean) == 10:
            return f"+91 {clean}"
        return clean

    @staticmethod
    def normalize_vehicle(plate: str) -> str:
        """Normalize Indian registration plates (e.g. UP14AB1234 -> UP14 AB 1234)."""
        if not plate:
            return ""
        clean = re.sub(r'[^A-Za-z0-9]', '', plate.strip().upper())
        match = re.match(r'^([A-Z]{2}\d{1,2})([A-Z]{1,2})(\d{4})$', clean)
        if match:
            return f"{match.group(1)} {match.group(2)} {match.group(3)}"
        return clean

    @staticmethod
    def compute_record_hash(record: Dict[str, Any]) -> str:
        """Generate a deterministic SHA-256 signature for deduplication."""
        canonical_str = json.dumps(record, sort_keys=True, default=str)
        return hashlib.sha256(canonical_str.encode('utf-8')).hexdigest()

    def _match_entity_by_phone(self, phone: str, db: Session) -> Optional[EntityModel]:
        if not phone:
            return None
        norm = self.normalize_phone(phone)
        # Search by phone masked or tags
        return db.query(EntityModel).filter(
            (EntityModel.phone_masked == norm) | (EntityModel.phone_masked.ilike(f"%{phone[-6:]}%"))
        ).first()

    def _match_entity_by_vehicle(self, plate: str, db: Session) -> Optional[EntityModel]:
        if not plate:
            return None
        norm = self.normalize_vehicle(plate)
        return db.query(EntityModel).filter(
            (EntityModel.vehicle_number == norm) | (EntityModel.vehicle_number.ilike(f"%{plate[-4:]}%"))
        ).first()

    def ingest_cdr_records(
        self,
        records: List[Dict[str, Any]],
        case_id: str = "case-sih-01",
        evidence_id: Optional[str] = None,
        source_file: Optional[str] = None,
        db: Optional[Session] = None
    ) -> IngestionResponse:
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True
        try:
            resp = IngestionResponse(recordsProcessed=len(records))

            for row in records:
                caller = row.get("caller") or row.get("calling_number") or row.get("source")
                receiver = row.get("receiver") or row.get("receiving_number") or row.get("target")
                timestamp = row.get("timestamp") or datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

                if not caller or not receiver:
                    resp.records_invalid += 1
                    resp.errors.append(f"Invalid CDR record: missing caller or receiver. Raw: {row}")
                    continue

                norm_caller = self.normalize_phone(caller)
                norm_receiver = self.normalize_phone(receiver)
                duration = int(row.get("duration_seconds") or row.get("duration") or 60)
                location = row.get("location") or "NCR Telecom Tower"
                city = row.get("city") or "Delhi"
                tower_id = row.get("tower_id") or row.get("towerId")

                # Deduplication check
                record_sig = self.compute_record_hash({
                    "case_id": case_id,
                    "type": "call",
                    "caller": norm_caller,
                    "receiver": norm_receiver,
                    "timestamp": timestamp,
                    "duration": duration
                })
                inter_id = f"call-{record_sig[:16]}"

                existing = db.query(InteractionModel).filter(InteractionModel.id == inter_id).first()
                if existing:
                    resp.records_duplicated += 1
                    continue

                # Match Entities
                src_entity = self._match_entity_by_phone(norm_caller, db)
                tgt_entity = self._match_entity_by_phone(norm_receiver, db)

                src_id = src_entity.id if src_entity else None
                tgt_id = tgt_entity.id if tgt_entity else None

                if src_id or tgt_id:
                    resp.entities_matched += 1

                interaction = InteractionModel(
                    id=inter_id,
                    case_id=case_id,
                    interaction_type="call",
                    source_entity_id=src_id,
                    target_entity_id=tgt_id,
                    caller_phone=norm_caller,
                    receiver_phone=norm_receiver,
                    duration_seconds=duration,
                    timestamp=timestamp,
                    location_name=location,
                    city=city,
                    evidence_id=evidence_id,
                    source_file=source_file,
                    notes=f"CDR tower match {tower_id}" if tower_id else "Ingested telephony capture.",
                    raw_record=row
                )
                db.add(interaction)
                resp.interactions_created += 1
                resp.records_valid += 1

                # Timeline event if duration > 180s or matched suspect
                if duration >= 180 or (src_id and tgt_id):
                    ev_title = f"Telephony Intercept: {src_entity.name if src_entity else norm_caller} ➔ {tgt_entity.name if tgt_entity else norm_receiver}"
                    time_ev = TimelineEventModel(
                        id=f"time-{inter_id}",
                        case_id=case_id,
                        timestamp=timestamp,
                        title=ev_title,
                        description=f"Recorded call session lasting {duration} seconds through tower {location}.",
                        category="wiretap",
                        location=location,
                        city=city,
                        entity_ids=[i for i in [src_id, tgt_id] if i],
                        entity_names=[n for n in [src_entity.name if src_entity else None, tgt_entity.name if tgt_entity else None] if n],
                        evidence_id=evidence_id,
                        confidence_score=90,
                        source_citation=f"CDR feed {source_file or 'telemetry'}"
                    )
                    db.add(time_ev)

            db.commit()

            # Trigger relationship synthesis
            resp.relationships_updated = relationship_service.derive_relationships_from_interactions(case_id, db)
            return resp
        except Exception as e:
            db.rollback()
            return IngestionResponse(
                status="error",
                recordsProcessed=len(records),
                errors=[str(e)]
            )
        finally:
            if close_db:
                db.close()

    def ingest_fastag_records(
        self,
        records: List[Dict[str, Any]],
        case_id: str = "case-sih-01",
        evidence_id: Optional[str] = None,
        source_file: Optional[str] = None,
        db: Optional[Session] = None
    ) -> IngestionResponse:
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True
        try:
            resp = IngestionResponse(recordsProcessed=len(records))

            for row in records:
                plate = row.get("vehicle_number") or row.get("vehicleNumber") or row.get("plate")
                toll = row.get("toll_plaza") or row.get("tollPlaza") or row.get("location") or "Expressway Toll"
                timestamp = row.get("timestamp") or datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

                if not plate:
                    resp.records_invalid += 1
                    continue

                norm_plate = self.normalize_vehicle(plate)
                city = row.get("city") or "Expressway Corridor"

                record_sig = self.compute_record_hash({
                    "case_id": case_id,
                    "type": "vehicle_sighting",
                    "plate": norm_plate,
                    "toll": toll,
                    "timestamp": timestamp
                })
                inter_id = f"transit-{record_sig[:16]}"

                existing = db.query(InteractionModel).filter(InteractionModel.id == inter_id).first()
                if existing:
                    resp.records_duplicated += 1
                    continue

                ent = self._match_entity_by_vehicle(norm_plate, db)
                ent_id = ent.id if ent else None
                if ent_id:
                    resp.entities_matched += 1

                interaction = InteractionModel(
                    id=inter_id,
                    case_id=case_id,
                    interaction_type="vehicle_sighting",
                    source_entity_id=ent_id,
                    vehicle_number=norm_plate,
                    toll_plaza=toll,
                    location_name=toll,
                    city=city,
                    timestamp=timestamp,
                    evidence_id=evidence_id,
                    source_file=source_file,
                    raw_record=row
                )
                db.add(interaction)
                resp.interactions_created += 1
                resp.records_valid += 1

                # Timeline event
                time_ev = TimelineEventModel(
                    id=f"time-{inter_id}",
                    case_id=case_id,
                    timestamp=timestamp,
                    title=f"ANPR Sighting: Vehicle {norm_plate}",
                    description=f"Automatic number plate recognition hit at {toll}.",
                    category="sighting",
                    location=toll,
                    city=city,
                    entity_ids=[ent_id] if ent_id else [],
                    entity_names=[ent.name] if ent else [],
                    evidence_id=evidence_id,
                    confidence_score=95,
                    source_citation="FASTag Electronic Toll Log"
                )
                db.add(time_ev)

            db.commit()
            return resp
        except Exception as e:
            db.rollback()
            return IngestionResponse(status="error", recordsProcessed=len(records), errors=[str(e)])
        finally:
            if close_db:
                db.close()


ingestion_service = IngestionService()
