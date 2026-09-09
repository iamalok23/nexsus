"""Modular Information Extraction Service.

DESIGN NOTE:
This service is architected with a clean interface (`BaseExtractionService`)
to allow seamless future replacement or augmentation with advanced AI tools:
1. spaCy NLP / Named Entity Recognition (NER) for offline high-speed tokenization.
2. Google Gemini API (Interactions API / Structured Output) for contextual reasoning,
   cross-document correlation, and synthetic pattern synthesis.

In this prototype, `RuleBasedExtractionService` uses pattern matching and synthetic entity
correlation against our synthetic Indian dataset.
"""
import re
import json
import csv
import io
from abc import ABC, abstractmethod
from typing import List, Dict, Any

from app.schemas.upload import ExtractedData, ExtractedEntityMatch
from app.services.mock_data import SYNTHETIC_ENTITIES


class BaseExtractionService(ABC):
    """Abstract base class for evidence extraction services."""

    @abstractmethod
    def extract(self, content_text: str, filename: str, file_format: str) -> ExtractedData:
        """Extract entities, identifiers, and summary tags from uploaded evidence content."""
        pass


class RuleBasedExtractionService(BaseExtractionService):
    """Prototype rule-based extractor using regular expressions and synthetic vocabulary.
    
    Can be seamlessly swapped with `GeminiExtractionService` or `SpacyExtractionService`.
    """

    # Regex for Indian phone numbers (handles masked formats like +91 98XXXXXX21 or standard numbers)
    PHONE_REGEX = re.compile(r'(?:\+91[\s\-]?)?[6-9][0-9X]{9}\b')

    # Regex for Indian vehicle registration marks (e.g. UP14 AB 1234, DL01 CA 9988)
    VEHICLE_REGEX = re.compile(r'\b[A-Z]{2}[0-9]{1,2}\s?[A-Z]{1,2}\s?[0-9]{4}\b')

    # Regex for Indian Rupee amounts (e.g. ₹12,50,000 or INR 5,00,000 or 12.5 Lakh)
    INR_REGEX = re.compile(r'(?:₹|INR\s?)\s?[\d,]+(?:\.\d+)?|\b\d+(?:\.\d+)?\s?(?:Lakh|Crore|Crores|Lakhs)\b', re.IGNORECASE)

    def __init__(self):
        # Known synthetic names and identifiers for fast correlation
        self.known_entities = {
            e["name"].lower(): e for e in SYNTHETIC_ENTITIES
        }

    def extract(self, content_text: str, filename: str, file_format: str) -> ExtractedData:
        extracted_entities: List[ExtractedEntityMatch] = []
        extraction_tags: List[str] = []

        # 1. Regex Pattern Matching
        phones = list(set(self.PHONE_REGEX.findall(content_text)))
        vehicles = list(set(self.VEHICLE_REGEX.findall(content_text)))
        currencies = list(set(self.INR_REGEX.findall(content_text)))

        # 2. Synthetic Entity Matching
        content_lower = content_text.lower()
        for name_lower, entity_meta in self.known_entities.items():
            if name_lower in content_lower:
                extracted_entities.append(
                    ExtractedEntityMatch(
                        name=entity_meta["name"],
                        type=entity_meta["type"],
                        matched_text=entity_meta["name"],
                        indicator_type="named_entity"
                    )
                )
                extraction_tags.append(entity_meta["name"])

        # 3. Format-specific parsing tags
        if file_format == "csv":
            try:
                reader = csv.reader(io.StringIO(content_text))
                row_count = sum(1 for _ in reader)
                extraction_tags.append(f"{row_count} CSV Rows Analyzed")
            except Exception:
                pass
        elif file_format == "json":
            try:
                parsed = json.loads(content_text)
                if isinstance(parsed, list):
                    extraction_tags.append(f"{len(parsed)} JSON Records")
                elif isinstance(parsed, dict):
                    extraction_tags.append(f"{len(parsed.keys())} JSON Keys")
            except Exception:
                pass

        # Build summary
        entity_count = len(extracted_entities)
        phone_count = len(phones)
        vehicle_count = len(vehicles)
        currency_count = len(currencies)

        summary = (
            f"Extraction completed for {filename} ({file_format.upper()}). "
            f"Identified {entity_count} entity reference(s), {phone_count} phone pattern(s), "
            f"{vehicle_count} vehicle identifier(s), and {currency_count} currency amount(s). "
            f"All findings require human analyst review."
        )

        for p in phones[:3]:
            extraction_tags.append(f"Phone: {p}")
        for v in vehicles[:2]:
            extraction_tags.append(f"Vehicle: {v}")
        for c in currencies[:2]:
            extraction_tags.append(f"Amount: {c}")

        return ExtractedData(
            summary=summary,
            entities=extracted_entities,
            phone_numbers=phones,
            vehicle_numbers=vehicles,
            currency_amounts=currencies,
            extraction_tags=list(set(extraction_tags)),
            extraction_engine="RuleBasedExtractionService (Upgrade path: spaCy / Gemini API)"
        )


# Default singleton instance
extraction_service = RuleBasedExtractionService()
