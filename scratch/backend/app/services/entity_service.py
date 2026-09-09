"""Service layer for Entity profiles."""
import copy
from typing import List, Optional
from app.services.mock_data import SYNTHETIC_ENTITIES
from app.schemas.entity import EntityResponse
from app.utils.errors import EntityNotFoundError


class EntityService:
    def __init__(self):
        self._entities = {e["id"]: copy.deepcopy(e) for e in SYNTHETIC_ENTITIES}

    def get_entity_by_id(self, entity_id: str) -> EntityResponse:
        entity = self._entities.get(entity_id)
        if not entity:
            raise EntityNotFoundError(entity_id)
        return EntityResponse.model_validate(entity)

    def list_entities(self, city: Optional[str] = None) -> List[EntityResponse]:
        results = list(self._entities.values())
        if city:
            results = [e for e in results if e.get("city", "").lower() == city.lower()]
        return [EntityResponse.model_validate(e) for e in results]


# Singleton instance
entity_service = EntityService()
