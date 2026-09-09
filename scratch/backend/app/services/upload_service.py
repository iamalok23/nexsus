"""Service layer for File Uploads and Evidence Registration."""
import hashlib
import os
import copy
from typing import Optional, Set
from fastapi import UploadFile

from app.schemas.upload import UploadResponse, FileDetails
from app.services.extraction_service import extraction_service
from app.services.case_service import case_service
from app.services.mock_data import SYNTHETIC_EVIDENCE, SYNTHETIC_DATASET_LABEL
from app.utils.errors import InvalidUploadError


class UploadService:
    # Strictly allowed formats for this prototype
    ALLOWED_EXTENSIONS: Set[str] = {".txt", ".csv", ".json"}

    def __init__(self):
        # In-memory store for synthetic evidence files
        self._evidence_store = {e["id"]: copy.deepcopy(e) for e in SYNTHETIC_EVIDENCE}

    async def process_upload(
        self,
        file: UploadFile,
        case_id: Optional[str] = "case-sih-01",
        title: Optional[str] = None,
        classification: Optional[str] = "LAW ENFORCEMENT SENSITIVE"
    ) -> UploadResponse:
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

        # 4. Decode content text safely
        try:
            content_text = content_bytes.decode("utf-8")
        except UnicodeDecodeError:
            try:
                content_text = content_bytes.decode("latin-1")
            except Exception:
                content_text = ""

        # 5. Extract structured indicators using the modular extraction service
        extracted_data = extraction_service.extract(
            content_text=content_text,
            filename=filename,
            file_format=file_format
        )

        # 6. Generate evidence ID and record
        evidence_idx = len(self._evidence_store) + 1
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
            "linked_entity_ids": [e.name for e in extracted_data.entities],
            "dataset_label": SYNTHETIC_DATASET_LABEL
        }

        # Store in evidence repository
        self._evidence_store[evidence_id] = evidence_record

        # Increment case evidence count
        if case.id in case_service._cases:
            case_service._cases[case.id]["evidence_count"] += 1

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


# Singleton instance
upload_service = UploadService()
