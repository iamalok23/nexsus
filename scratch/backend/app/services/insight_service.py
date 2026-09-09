"""Service layer for AI & Analytical Insights."""
import copy
from app.services.mock_data import (
    SYNTHETIC_PATTERNS,
    SYNTHETIC_ALERTS,
    SYNTHETIC_METRICS,
    SYNTHETIC_DATASET_LABEL
)
from app.schemas.insight import (
    CrimePattern,
    ThreatAlert,
    MetricData,
    CaseInsightsResponse
)
from app.services.case_service import case_service


class InsightService:
    def __init__(self):
        self._patterns = copy.deepcopy(SYNTHETIC_PATTERNS)
        self._alerts = copy.deepcopy(SYNTHETIC_ALERTS)
        self._metrics = copy.deepcopy(SYNTHETIC_METRICS)

    def get_case_insights(self, case_id: str) -> CaseInsightsResponse:
        case = case_service.get_case_by_id(case_id)

        return CaseInsightsResponse(
            case_id=case.id,
            case_title=case.title,
            summary=(
                "Synthetic analytical summary: Multi-node corridor analysis indicates 2 possible patterns "
                "(Layered Financial Routing and Highway FASTag Transit). All indicators require human analyst review."
            ),
            patterns=[CrimePattern.model_validate(p) for p in self._patterns],
            alerts=[ThreatAlert.model_validate(a) for a in self._alerts],
            metrics=[MetricData.model_validate(m) for m in self._metrics],
            dataset_label=SYNTHETIC_DATASET_LABEL
        )


# Singleton instance
insight_service = InsightService()
