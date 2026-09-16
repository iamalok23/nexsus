"""Service layer for File Uploads and Evidence Registration with SQLite Persistence."""
import hashlib
import os
import copy
from datetime import datetime, timezone
from typing import Optional, Set, List, Dict, Any
from fastapi import UploadFile
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.models.evidence import EvidenceModel
from app.utils.database import SessionLocal
from app.schemas.upload import UploadResponse, FileDetails, ExtractedData, ExtractedEntityMatch
from app.services.extraction_service import extraction_service
from app.services.case_service import case_service
from app.services.mock_data import SYNTHETIC_EVIDENCE, SYNTHETIC_DATASET_LABEL
from app.utils.errors import InvalidUploadError, DatabaseOperationError


class UploadService:
    # Strictly allowed formats for this prototype
    ALLOWED_EXTENSIONS: Set[str] = {".txt", ".csv", ".json"}

    def __init__(self):
        # In-memory store for synthetic evidence files (seeded from SYNTHETIC_EVIDENCE)
        self._evidence_store = {e["id"]: copy.deepcopy(e) for e in SYNTHETIC_EVIDENCE}

    def _sync_db_to_memory(self, db: Session):
        """Ensure newly persisted evidence from SQLite is reflected in memory."""
        try:
            db_records = db.query(EvidenceModel).all()
            for r in db_records:
                if r.id not in self._evidence_store:
                    self._evidence_store[r.id] = {
                        "id": r.id,
                        "evidence_number": r.evidence_number,
                        "case_id": r.case_id,
                        "case_name": r.case_name,
                        "title": r.title,
                        "type": r.type,
                        "classification": r.classification,
                        "hash_sha256": r.hash_sha256,
                        "file_details": r.file_details or {},
                        "ai_summary": r.ai_summary or "",
                        "ai_extraction_tags": r.ai_extraction_tags or [],
                        "linked_entity_ids": r.linked_entity_ids or [],
                        "dataset_label": SYNTHETIC_DATASET_LABEL
                    }
        except Exception:
            pass

    async def process_upload(
        self,
        file: UploadFile,
        case_id: Optional[str] = "case-sih-01",
        title: Optional[str] = None,
        classification: Optional[str] = "LAW ENFORCEMENT SENSITIVE",
        db: Optional[Session] = None
    ) -> UploadResponse:
        # Create a session if not passed directly
        close_session = False
        if db is None:
            db = SessionLocal()
            close_session = True

        try:
            # 1. Validate file extension
            filename = file.filename or "unknown_evidence.txt"
            _, ext = os.path.splitext(filename)
            ext_lower = ext.lower()

            if ext_lower not in self.ALLOWED_EXTENSIONS:
                allowed = ", ".join(sorted(self.ALLOWED_EXTENSIONS))
                raise InvalidUploadError(
                    message=f"File extension '{ext_lower}' is not supported in this prototype. Allowed formats are: {allowed}.",
                    details={"provided_extension": ext_lower, "allowed_extensions": list(self.ALLOWED_EXTENSIONS)}
                )

            # 2. Validate case exists
            case = case_service.get_case_by_id(case_id)

            # 3. Read content bytes and compute SHA-256
            content_bytes = await file.read()
            size_bytes = len(content_bytes)

            sha256_hash = hashlib.sha256(content_bytes).hexdigest()

            # Format file size for human display
            if size_bytes < 1024:
                size_formatted = f"{size_bytes} B"
            elif size_bytes < 1024 * 1024:
                size_formatted = f"{size_bytes / 1024:.1f} KB"
            else:
                size_formatted = f"{size_bytes / (1024 * 1024):.1f} MB"

            file_format = ext_lower.lstrip(".")

            # 4. Check for duplicate database records (Requirement 9: avoid duplicate database records)
            try:
                existing_record = db.query(EvidenceModel).filter(
                    EvidenceModel.hash_sha256 == sha256_hash,
                    EvidenceModel.case_id == case.id
                ).first()

                if existing_record:
                    file_details_dict = existing_record.file_details or {}
                    file_details = FileDetails(
                        filename=file_details_dict.get("filename", filename),
                        size_bytes=file_details_dict.get("sizeBytes", file_details_dict.get("size_bytes", size_bytes)),
                        size_formatted=file_details_dict.get("sizeFormatted", file_details_dict.get("size_formatted", size_formatted)),
                        format=file_details_dict.get("format", file_format),
                        mime_type=file_details_dict.get("mimeType", file.content_type)
                    )
                    extracted_entities = [
                        ExtractedEntityMatch(
                            name=name,
                            type="subject_of_interest",
                            matched_text=name,
                            indicator_type="named_entity"
                        ) for name in (existing_record.linked_entity_ids or [])
                    ]
                    v_list = [existing_record.vehicle_ref] if existing_record.vehicle_ref else []
                    p_list = [existing_record.phone_ref] if existing_record.phone_ref else []
                    c_list = [existing_record.amount_inr] if existing_record.amount_inr else []
                    for tag in (existing_record.ai_extraction_tags or []):
                        if tag.startswith("Vehicle: "):
                            val = tag.replace("Vehicle: ", "").strip()
                            if val not in v_list:
                                v_list.append(val)
                        elif tag.startswith("Phone: "):
                            val = tag.replace("Phone: ", "").strip()
                            if val not in p_list:
                                p_list.append(val)
                        elif tag.startswith("Amount: "):
                            val = tag.replace("Amount: ", "").strip()
                            if val not in c_list:
                                c_list.append(val)

                    extracted_data = ExtractedData(
                        summary=existing_record.ai_summary or f"Duplicate evidence record detected in case '{case.id}'. Reusing verified dossier.",
                        entities=extracted_entities,
                        phone_numbers=p_list,
                        vehicle_numbers=v_list,
                        currency_amounts=c_list,
                        extraction_tags=existing_record.ai_extraction_tags or []
                    )
                    return UploadResponse(
                        id=existing_record.id,
                        evidence_number=existing_record.evidence_number,
                        case_id=existing_record.case_id,
                        case_name=existing_record.case_name,
                        title=existing_record.title,
                        hash_sha256=existing_record.hash_sha256,
                        file_details=file_details,
                        extraction=extracted_data,
                        review_status="Requires Human Review",
                        dataset_label=SYNTHETIC_DATASET_LABEL
                    )
            except SQLAlchemyError as err:
                db.rollback()
                raise DatabaseOperationError(
                    message=f"Database error checking for existing record: {str(err)}",
                    details={"error": str(err)}
                )

            # 5. Decode content text safely
            try:
                content_text = content_bytes.decode("utf-8")
            except UnicodeDecodeError:
                try:
                    content_text = content_bytes.decode("latin-1")
                except Exception:
                    content_text = ""

            # 6. Extract structured indicators using the modular extraction service
            extracted_data = extraction_service.extract(
                content_text=content_text,
                filename=filename,
                file_format=file_format
            )

            # 7. Generate evidence ID and record
            try:
                db_count = db.query(EvidenceModel).count()
            except SQLAlchemyError:
                db_count = 0

            evidence_idx = max(len(self._evidence_store), db_count) + 1
            evidence_id = f"ev-synth-{evidence_idx:02d}"
            evidence_number = f"EV-2026-SYNTH-{evidence_idx:02d}"

            # Ensure uniqueness in SQLite
            while db.query(EvidenceModel).filter(
                (EvidenceModel.id == evidence_id) | (EvidenceModel.evidence_number == evidence_number)
            ).first() is not None:
                evidence_idx += 1
                evidence_id = f"ev-synth-{evidence_idx:02d}"
                evidence_number = f"EV-2026-SYNTH-{evidence_idx:02d}"

            doc_title = title or f"Ingested Evidence: {filename}"

            file_details = FileDetails(
                filename=filename,
                size_bytes=size_bytes,
                size_formatted=size_formatted,
                format=file_format,
                mime_type=file.content_type
            )

            # 8. Persist to SQLite EvidenceModel (Requirement 3 & 4)
            now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S IST")
            amount_inr = extracted_data.currency_amounts[0] if extracted_data.currency_amounts else None
            phone_ref = extracted_data.phone_numbers[0] if extracted_data.phone_numbers else None
            vehicle_ref = extracted_data.vehicle_numbers[0] if extracted_data.vehicle_numbers else None
            linked_entities = [e.name for e in extracted_data.entities]

            evidence_db_record = EvidenceModel(
                id=evidence_id,
                evidence_number=evidence_number,
                case_id=case.id,
                case_name=case.title,
                title=doc_title,
                type=file_format,
                classification=classification,
                date_collected=now_str,
                collected_by="Sub-Inspector R. K. Sharma",
                badge_number="DL-SPL-4412",
                location=f"{case.title} Sector Station",
                city="Ghaziabad" if "ghaziabad" in content_text.lower() else "Delhi",
                hash_sha256=sha256_hash,
                ai_summary=extracted_data.summary,
                ai_extraction_tags=extracted_data.extraction_tags,
                linked_entity_ids=linked_entities,
                amount_inr=amount_inr,
                phone_ref=phone_ref,
                vehicle_ref=vehicle_ref,
                file_details=file_details.model_dump(by_alias=True)
            )

            try:
                db.add(evidence_db_record)
                db.commit()
                db.refresh(evidence_db_record)
            except SQLAlchemyError as err:
                db.rollback()
                raise DatabaseOperationError(
                    message=f"Failed to persist evidence record in database: {str(err)}",
                    details={"evidence_id": evidence_id, "error": str(err)}
                )

            # Store in evidence repository & sync
            evidence_record = {
                "id": evidence_id,
                "evidence_number": evidence_number,
                "case_id": case.id,
                "case_name": case.title,
                "title": doc_title,
                "type": file_format,
                "classification": classification,
                "hash_sha256": sha256_hash,
                "file_details": file_details.model_dump(by_alias=True),
                "ai_summary": extracted_data.summary,
                "ai_extraction_tags": extracted_data.extraction_tags,
                "linked_entity_ids": linked_entities,
                "dataset_label": SYNTHETIC_DATASET_LABEL
            }
            self._evidence_store[evidence_id] = evidence_record

            # Increment case evidence count in SQLite
            from app.models.case import CaseModel
            case_obj = db.query(CaseModel).filter(CaseModel.id == case.id).first()
            if case_obj:
                case_obj.evidence_count = (case_obj.evidence_count or 0) + 1
                db.commit()

            return UploadResponse(
                id=evidence_id,
                evidence_number=evidence_number,
                case_id=case.id,
                case_name=case.title,
                title=doc_title,
                hash_sha256=sha256_hash,
                file_details=file_details,
                extraction=extracted_data,
                review_status="Requires Human Review",
                dataset_label=SYNTHETIC_DATASET_LABEL
            )
        finally:
            if close_session and db:
                db.close()

    def seed_initial_evidence(self, db: Optional[Session] = None):
        """Seed default synthetic evidence items into SQLite if not already present."""
        close_session = False
        if db is None:
            db = SessionLocal()
            close_session = True
        try:
            for ev in SYNTHETIC_EVIDENCE:
                exists = db.query(EvidenceModel).filter_by(id=ev["id"]).first()
                if not exists:
                    file_det = ev.get("file_details") or {}
                    record = EvidenceModel(
                        id=ev["id"],
                        evidence_number=ev["evidence_number"],
                        case_id=ev["case_id"],
                        case_name=ev.get("case_name", "Operation Chakravyuh"),
                        title=ev["title"],
                        type=ev.get("type", "document"),
                        classification=ev.get("classification", "LAW ENFORCEMENT SENSITIVE"),
                        date_collected=ev.get("date_collected", "2026-09-07 12:00 IST"),
                        collected_by=ev.get("collected_by", "Sub-Inspector R. K. Sharma"),
                        badge_number=ev.get("badge_number", "DL-SPL-4412"),
                        location=ev.get("location", "Delhi NCR"),
                        city=ev.get("city", "Delhi"),
                        hash_sha256=ev["hash_sha256"],
                        ai_summary=ev.get("ai_summary", ""),
                        ai_extraction_tags=ev.get("ai_extraction_tags", []),
                        linked_entity_ids=ev.get("linked_entity_ids", []),
                        amount_inr=ev.get("amount_inr"),
                        phone_ref=ev.get("phone_ref"),
                        vehicle_ref=ev.get("vehicle_ref"),
                        file_details={
                            "filename": file_det.get("filename", f"{ev['id']}.txt"),
                            "size": file_det.get("size", "3.6 MB"),
                            "format": file_det.get("format", ev.get("type", "document").upper())
                        }
                    )
                    db.add(record)
            db.commit()
        except Exception as err:
            db.rollback()
            print(f"Warning: Failed to seed initial evidence: {err}")
        finally:
            if close_session and db:
                db.close()

    def _format_evidence(self, r: EvidenceModel) -> Dict[str, Any]:
        """Format an EvidenceModel SQLAlchemy row into the frontend Evidence schema."""
        file_det = r.file_details or {}
        size_str = file_det.get("size") or file_det.get("sizeFormatted") or file_det.get("size_formatted") or "3.6 MB"
        format_str = file_det.get("format") or (r.type.upper() if r.type else "DOCUMENT")
        filename_str = file_det.get("filename") or f"{r.id}.txt"

        return {
            "id": r.id,
            "evidenceNumber": r.evidence_number,
            "caseId": r.case_id,
            "caseName": r.case_name or "Operation Chakravyuh",
            "title": r.title,
            "type": r.type or "document",
            "classification": r.classification or "LAW ENFORCEMENT SENSITIVE",
            "dateCollected": r.date_collected,
            "collectedBy": r.collected_by or "Special Unit",
            "badgeNumber": r.badge_number or "DL-SPL-4412",
            "location": r.location or "Delhi NCR",
            "city": r.city or "Delhi",
            "hashSHA256": r.hash_sha256,
            "aiSummary": r.ai_summary or "",
            "aiExtractionTags": r.ai_extraction_tags or [],
            "linkedEntityIds": r.linked_entity_ids or [],
            "amountINR": r.amount_inr,
            "phoneRef": r.phone_ref,
            "vehicleRef": r.vehicle_ref,
            "fileDetails": {
                "filename": filename_str,
                "size": size_str,
                "duration": file_det.get("duration"),
                "format": format_str
            }
        }

    def get_all_evidence(self, case_id: Optional[str] = None, db: Optional[Session] = None) -> List[Dict[str, Any]]:
        """Retrieve evidence from SQLite database with in-memory fallback."""
        close_session = False
        if db is None:
            db = SessionLocal()
            close_session = True

        try:
            query = db.query(EvidenceModel)
            if case_id:
                query = query.filter(EvidenceModel.case_id == case_id)
            records = query.order_by(EvidenceModel.created_at.desc()).all()

            if records:
                return [self._format_evidence(r) for r in records]
            else:
                # Return in-memory items if SQLite is empty
                items = list(self._evidence_store.values())
                if case_id:
                    items = [i for i in items if i.get("case_id") == case_id]
                return items
        except Exception:
            items = list(self._evidence_store.values())
            if case_id:
                items = [i for i in items if i.get("case_id") == case_id]
            return items
        finally:
            if close_session and db:
                db.close()

    def get_evidence_by_id(self, evidence_id: str, db: Optional[Session] = None) -> Optional[Dict[str, Any]]:
        """Retrieve a single evidence record by id or evidence_number from SQLite."""
        close_session = False
        if db is None:
            db = SessionLocal()
            close_session = True

        try:
            r = db.query(EvidenceModel).filter(
                (EvidenceModel.id == evidence_id) | (EvidenceModel.evidence_number == evidence_id)
            ).first()

            if r:
                return self._format_evidence(r)

            # Fallback to in-memory store
            if evidence_id in self._evidence_store:
                item = self._evidence_store[evidence_id]
                file_det = item.get("file_details") or item.get("fileDetails") or {}
                return {
                    "id": item.get("id"),
                    "evidenceNumber": item.get("evidence_number", item.get("evidenceNumber")),
                    "caseId": item.get("case_id", item.get("caseId")),
                    "caseName": item.get("case_name", item.get("caseName", "Operation Chakravyuh")),
                    "title": item.get("title"),
                    "type": item.get("type", "document"),
                    "classification": item.get("classification", "LAW ENFORCEMENT SENSITIVE"),
                    "dateCollected": item.get("date_collected", item.get("dateCollected", "2026-09-07 12:00 IST")),
                    "collectedBy": item.get("collected_by", item.get("collectedBy", "Sub-Inspector R. K. Sharma")),
                    "badgeNumber": item.get("badge_number", item.get("badgeNumber", "DL-SPL-4412")),
                    "location": item.get("location", "Delhi NCR"),
                    "city": item.get("city", "Delhi"),
                    "hashSHA256": item.get("hash_sha256", item.get("hashSHA256", "")),
                    "aiSummary": item.get("ai_summary", item.get("aiSummary", "")),
                    "aiExtractionTags": item.get("ai_extraction_tags", item.get("aiExtractionTags", [])),
                    "linkedEntityIds": item.get("linked_entity_ids", item.get("linkedEntityIds", [])),
                    "amountINR": item.get("amount_inr", item.get("amountINR")),
                    "phoneRef": item.get("phone_ref", item.get("phoneRef")),
                    "vehicleRef": item.get("vehicle_ref", item.get("vehicleRef")),
                    "fileDetails": {
                        "filename": file_det.get("filename", f"{item.get('id')}.txt"),
                        "size": file_det.get("size", "3.6 MB"),
                        "format": file_det.get("format", "DOCUMENT")
                    }
                }
            return None
        finally:
            if close_session and db:
                db.close()


# Singleton instance
upload_service = UploadService()
