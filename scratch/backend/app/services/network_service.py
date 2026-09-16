"""Service layer for Network Graph Analysis using NetworkX and SQLite."""
from typing import Optional, Dict, Any, List
import networkx as nx
from sqlalchemy.orm import Session

from app.models.entity import EntityModel
from app.models.relationship import RelationshipModel
from app.models.case_entity import CaseEntityModel
from app.utils.database import SessionLocal
from app.services.mock_data import SYNTHETIC_DATASET_LABEL
from app.schemas.network import (
    GraphNode,
    GraphEdge,
    GraphMetrics,
    NetworkGraphData,
    EdgeRelationship
)
from app.schemas.entity import EntityType
from app.services.case_service import case_service
from app.services.entity_service import entity_service
from app.services.relationship_service import relationship_service


class NetworkService:
    def __init__(self):
        pass

    def get_network_graph(self, case_id: str, filter_type: Optional[str] = None, db: Optional[Session] = None) -> NetworkGraphData:
        """Analyze graph structure using NetworkX and return dynamically enriched nodes and edges."""
        close_db = False
        if db is None:
            db = SessionLocal()
            close_db = True

        try:
            # Validate case exists
            case_service.get_case_by_id(case_id, db=db)

            # Ensure entities and relationships are seeded if tables empty
            if db.query(EntityModel).count() == 0:
                entity_service.seed_initial_entities(db=db)
            if db.query(RelationshipModel).count() == 0:
                relationship_service.seed_initial_relationships(db=db)

            # Fetch entities for this case
            # 1. Direct links in CaseEntityModel
            linked_ids = [r.entity_id for r in db.query(CaseEntityModel).filter(CaseEntityModel.case_id == case_id).all()]
            
            # If no explicit links, or if default case, include all entities
            if not linked_ids or case_id == "case-sih-01":
                entities = db.query(EntityModel).all()
            else:
                entities = db.query(EntityModel).filter(EntityModel.id.in_(linked_ids)).all()

            entity_dict: Dict[str, EntityModel] = {e.id: e for e in entities}

            # Fetch relationships for this case
            rels = db.query(RelationshipModel).filter(RelationshipModel.case_id == case_id).all()
            if not rels and case_id == "case-sih-01":
                rels = db.query(RelationshipModel).all()

            # Construct NetworkX Graph
            G = nx.Graph()

            for eid, ent in entity_dict.items():
                G.add_node(
                    eid,
                    label=ent.name,
                    type=ent.type,
                    risk_score=ent.risk_score,
                    status=ent.status,
                    city=ent.city,
                    phone_masked=ent.phone_masked,
                    vehicle_number=ent.vehicle_number
                )

            valid_edges_raw = []
            for r in rels:
                if r.source_id in entity_dict and r.target_id in entity_dict:
                    weight = float(r.strength_score or 1.0)
                    G.add_edge(
                        r.source_id,
                        r.target_id,
                        id=r.id,
                        relationship=r.relationship_type,
                        label=r.label,
                        amount_inr=r.amount_inr,
                        frequency=r.frequency,
                        is_suspicious=str(r.is_suspicious).lower() in ["true", "1", "yes"],
                        weight=weight
                    )
                    valid_edges_raw.append(r)

            # Compute NetworkX metrics
            degrees = dict(G.degree())
            node_count = G.number_of_nodes()
            edge_count = G.number_of_edges()

            if node_count > 0:
                degree_centrality = nx.degree_centrality(G)
                betweenness_centrality = nx.betweenness_centrality(G)
                clustering_coeff = nx.clustering(G)
                density = round(float(nx.density(G)), 4)
                avg_degree = round(sum(degrees.values()) / max(node_count, 1), 2)
            else:
                degree_centrality = {}
                betweenness_centrality = {}
                clustering_coeff = {}
                density = 0.0
                avg_degree = 0.0

            # Predefined coordinates for tactical visualization
            base_coords = {
                "ent-1": (380.0, 220.0),
                "ent-2": (200.0, 150.0),
                "ent-3": (540.0, 140.0),
                "ent-4": (500.0, 340.0),
                "ent-5": (220.0, 330.0),
                "ent-v1": (340.0, 380.0),
                "ent-b1": (120.0, 240.0),
            }

            # If dynamic nodes exist without base coords, assign deterministic coordinates
            dynamic_nodes = [nid for nid in G.nodes if nid not in base_coords]
            if dynamic_nodes:
                import math
                angle_step = (2 * math.pi) / max(len(dynamic_nodes), 1)
                for idx, nid in enumerate(dynamic_nodes):
                    cx = 400.0 + 160.0 * math.cos(idx * angle_step)
                    cy = 250.0 + 110.0 * math.sin(idx * angle_step)
                    base_coords[nid] = (round(cx, 1), round(cy, 1))

            # Clusters
            clusters = {
                "ent-1": "Logistics Core",
                "ent-2": "Financial Link",
                "ent-3": "Corporate Front",
                "ent-4": "Transit Operations",
                "ent-5": "Telecom Relay",
                "ent-v1": "Fleet Asset",
                "ent-b1": "Banking Channel",
            }

            # Map relationship types to enum
            rel_mapping = {
                "financial_transfer": EdgeRelationship.FINANCIAL_TRANSFER,
                "hawala_transfer": EdgeRelationship.HAWALA_TRANSFER,
                "commercial_associate": EdgeRelationship.COMMERCIAL_ASSOCIATE,
                "known_associate": EdgeRelationship.KNOWN_ASSOCIATE,
                "logistics_coordination": EdgeRelationship.LOGISTICS_COORDINATION,
                "banking_deposit": EdgeRelationship.BANKING_DEPOSIT,
                "banking_withdrawal": EdgeRelationship.BANKING_WITHDRAWAL,
                "registered_keeper": EdgeRelationship.REGISTERED_KEEPER,
                "vehicle_registered": EdgeRelationship.VEHICLE_REGISTERED,
                "transit_observation": EdgeRelationship.TRANSIT_OBSERVATION,
                "courier": EdgeRelationship.COURIER,
                "telecom_contact": EdgeRelationship.TELECOM_CONTACT,
                "phone_call": EdgeRelationship.PHONE_CALL,
                "frequent_caller": EdgeRelationship.PHONE_CALL,
                "financial_loop": EdgeRelationship.HAWALA_TRANSFER,
                "business_contact": EdgeRelationship.BUSINESS_CONTACT,
                "director": EdgeRelationship.DIRECTOR,
                "safehouse_access": EdgeRelationship.SAFEHOUSE_ACCESS,
            }

            # Build enriched nodes
            enriched_nodes: List[GraphNode] = []
            for eid, ent in entity_dict.items():
                if filter_type and ent.type != filter_type:
                    continue

                x, y = base_coords.get(eid, (350.0, 250.0))
                ent_type = EntityType(ent.type) if ent.type in EntityType._value2member_map_ else EntityType.SUBJECT_OF_INTEREST

                node = GraphNode(
                    id=eid,
                    label=ent.name,
                    type=ent_type,
                    risk_score=ent.risk_score,
                    degree=degrees.get(eid, 0),
                    degree_centrality=round(degree_centrality.get(eid, 0.0), 4),
                    betweenness_centrality=round(betweenness_centrality.get(eid, 0.0), 4),
                    clustering_coefficient=round(clustering_coeff.get(eid, 0.0), 4),
                    cluster=clusters.get(eid, "Corridor Operatives"),
                    status=ent.status or "Requires Human Review",
                    is_hvt=ent.risk_score >= 80,
                    is_core=True,
                    city=ent.city,
                    phone_masked=ent.phone_masked,
                    vehicle_number=ent.vehicle_number,
                    x=x,
                    y=y
                )
                enriched_nodes.append(node)

            # Build enriched edges
            edges: List[GraphEdge] = []
            for r in valid_edges_raw:
                enum_rel = rel_mapping.get(r.relationship_type.lower(), EdgeRelationship.KNOWN_ASSOCIATE)
                edge = GraphEdge(
                    id=r.id,
                    source=r.source_id,
                    target=r.target_id,
                    relationship=enum_rel,
                    label=r.label or "Investigative Link",
                    amount_inr=r.amount_inr,
                    frequency=r.frequency or 1,
                    is_suspicious=str(r.is_suspicious).lower() in ["true", "1", "yes"],
                    weight=float(r.strength_score or 1.0)
                )
                edges.append(edge)

            metrics = GraphMetrics(
                node_count=node_count,
                edge_count=edge_count,
                density=density,
                average_degree=avg_degree,
                analysis_engine="NetworkX 3.x (SQLite Backed)"
            )

            return NetworkGraphData(
                case_id=case_id,
                nodes=enriched_nodes,
                edges=edges,
                metrics=metrics,
                dataset_label=SYNTHETIC_DATASET_LABEL
            )
        finally:
            if close_db:
                db.close()


# Singleton instance
network_service = NetworkService()
