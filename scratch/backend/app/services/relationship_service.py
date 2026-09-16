"""Service layer for Relationship Analysis and Investigative Leads derivation."""
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

from app.models.relationship import RelationshipModel
from app.models.interaction import InteractionModel
from app.models.entity import EntityModel
from app.utils.database import SessionLocal
from app.services.mock_data import SYNTHETIC_EDGES


class RelationshipService:
    def __init__(self):
        pass

    def seed_initial_relationships(self, db: Optional[Session] = None):
        """Seed initial synthetic relationships from SYNTHETIC_EDGES if empty."""
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True
        try:
            if db.query(RelationshipModel).count() == 0:
                for edge in SYNTHETIC_EDGES:
                    rel_obj = RelationshipModel(
                        id=edge["id"],
                        case_id="case-sih-01",
                        source_id=edge["source"],
                        target_id=edge["target"],
                        relationship_type=edge.get("relationship", "syndicate_link"),
                        label=edge.get("label", "Investigative Link"),
                        strength_score=edge.get("weight", 0.7),
                        frequency=edge.get("frequency", 1),
                        amount_inr=edge.get("amount_inr"),
                        is_suspicious="true" if edge.get("is_suspicious") else "false",
                        source_evidence_id="ev-1",
                        supporting_interaction_ids=[],
                        investigator_notes="Derived from synthetic intelligence capture."
                    )
                    db.add(rel_obj)
                db.commit()
        except Exception:
            db.rollback()
        finally:
            if close_db:
                db.close()

    def get_relationships_for_case(
        self,
        case_id: str,
        relationship_type: Optional[str] = None,
        min_strength: Optional[float] = None,
        db: Optional[Session] = None
    ) -> List[RelationshipModel]:
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True
        try:
            if db.query(RelationshipModel).count() == 0:
                self.seed_initial_relationships(db)

            query = db.query(RelationshipModel).filter(RelationshipModel.case_id == case_id)
            if relationship_type and relationship_type.upper() != "ALL":
                query = query.filter(RelationshipModel.relationship_type.ilike(f"%{relationship_type}%"))
            if min_strength is not None:
                query = query.filter(RelationshipModel.strength_score >= min_strength)

            return query.all()
        finally:
            if close_db:
                db.close()

    def derive_relationships_from_interactions(self, case_id: str, db: Optional[Session] = None) -> int:
        """Analyze interactions for a case and synthesize relationship leads.
        
        NOTE: All relationships are investigative leads requiring human analyst review.
        """
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True
        try:
            interactions = db.query(InteractionModel).filter(InteractionModel.case_id == case_id).all()
            if not interactions:
                return 0

            # 1. Group calls between entities
            call_pairs: Dict[tuple, List[InteractionModel]] = {}
            # 2. Group financial transfers
            finance_pairs: Dict[tuple, List[InteractionModel]] = {}

            for inter in interactions:
                src = inter.source_entity_id
                tgt = inter.target_entity_id
                if src and tgt and src != tgt:
                    pair_key = tuple(sorted([src, tgt]))
                    if inter.interaction_type in ["call", "sms"]:
                        call_pairs.setdefault(pair_key, []).append(inter)
                    elif inter.interaction_type == "financial_transfer":
                        finance_pairs.setdefault(pair_key, []).append(inter)

            updated_count = 0

            # Process Call Pairs
            for (ent_a, ent_b), call_list in call_pairs.items():
                freq = len(call_list)
                strength = min(1.0, 0.4 + (freq * 0.1))
                rel_id = f"rel-call-{case_id}-{ent_a}-{ent_b}"

                existing = db.query(RelationshipModel).filter(RelationshipModel.id == rel_id).first()
                if existing:
                    existing.frequency = freq
                    existing.strength_score = strength
                    existing.last_seen = call_list[-1].timestamp
                else:
                    new_rel = RelationshipModel(
                        id=rel_id,
                        case_id=case_id,
                        source_id=ent_a,
                        target_id=ent_b,
                        relationship_type="frequent_caller",
                        label=f"Telephony Intercept ({freq} Calls)",
                        strength_score=strength,
                        frequency=freq,
                        first_seen=call_list[0].timestamp,
                        last_seen=call_list[-1].timestamp,
                        is_suspicious="true" if freq >= 3 else "false",
                        source_evidence_id=call_list[0].evidence_id,
                        supporting_interaction_ids=[i.id for i in call_list],
                        investigator_notes="Repeated telephony burst logged between subjects."
                    )
                    db.add(new_rel)
                updated_count += 1

            # Process Financial Pairs
            for (ent_a, ent_b), fin_list in finance_pairs.items():
                total_amt = sum(f.amount_inr or 0.0 for f in fin_list)
                amt_str = f"₹{total_amt:,.0f}" if total_amt > 0 else "Layered RTGS"
                rel_id = f"rel-fin-{case_id}-{ent_a}-{ent_b}"

                existing = db.query(RelationshipModel).filter(RelationshipModel.id == rel_id).first()
                if existing:
                    existing.amount_inr = amt_str
                    existing.frequency = len(fin_list)
                else:
                    new_rel = RelationshipModel(
                        id=rel_id,
                        case_id=case_id,
                        source_id=ent_a,
                        target_id=ent_b,
                        relationship_type="financial_loop",
                        label=f"Hawala Flow ({amt_str})",
                        strength_score=0.9,
                        frequency=len(fin_list),
                        amount_inr=amt_str,
                        is_suspicious="true",
                        source_evidence_id=fin_list[0].evidence_id,
                        supporting_interaction_ids=[i.id for i in fin_list],
                        investigator_notes="Coordinated fund transfers identified."
                    )
                    db.add(new_rel)
                updated_count += 1

            db.commit()
            return updated_count
        except Exception:
            db.rollback()
            return 0
        finally:
            if close_db:
                db.close()


relationship_service = RelationshipService()
