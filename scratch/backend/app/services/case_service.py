"""Service layer for Case management."""
import copy
from datetime import datetime, timezone
from typing import List, Optional
from app.services.mock_data import SYNTHETIC_CASES, SYNTHETIC_DATASET_LABEL
from app.schemas.case import CaseCreate, CaseResponse
from app.utils.errors import CaseNotFoundError


class CaseService:
    def __init__(self):
        # In-memory store initialized with deepcopy of synthetic dataset
        self._cases = {c["id"]: copy.deepcopy(c) for c in SYNTHETIC_CASES}

    def get_cases(
        self,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[CaseResponse]:
        results = list(self._cases.values())

        if status:
            results = [c for c in results if c["status"].lower() == status.lower()]
        if priority:
            results = [c for c in results if c["priority"].lower() == priority.lower()]
        if search:
            query = search.lower()
            results = [
                c for c in results
                if query in c["title"].lower()
                or query in c["description"].lower()
                or query in c.get("code_name", "").lower()
            ]

        return [CaseResponse.model_validate(c) for c in results]

    def get_case_by_id(self, case_id: str) -> CaseResponse:
        case = self._cases.get(case_id)
        if not case:
            raise CaseNotFoundError(case_id)
        return CaseResponse.model_validate(case)

    def create_case(self, case_in: CaseCreate) -> CaseResponse:
        now = datetime.now(timezone.utc).isoformat()
        case_id = f"case-{len(self._cases) + 1:02d}"
        case_num = case_in.case_number or f"CASE-2026-SYNTH-{len(self._cases) + 1:02d}"

        new_case_dict = {
            "id": case_id,
            "case_number": case_num,
            "title": case_in.title,
            "description": case_in.description,
            "code_name": case_in.code_name,
            "status": case_in.status.value,
            "priority": case_in.priority.value,
            "lead_investigator": case_in.lead_investigator,
            "agency": case_in.agency,
            "jurisdiction": case_in.jurisdiction,
            "opened_date": now[:10],
            "last_updated": now,
            "warrants_issued": 0,
            "assets_seized": "₹0",
            "entities_count": 0,
            "evidence_count": 0,
            "risk_index": 50,
            "dataset_label": SYNTHETIC_DATASET_LABEL
        }

        self._cases[case_id] = new_case_dict
        return CaseResponse.model_validate(new_case_dict)


# Singleton instance
case_service = CaseService()
