"""Service layer for Network Graph Analysis using NetworkX."""
import copy
from typing import Optional
import networkx as nx

from app.services.mock_data import (
    SYNTHETIC_ENTITIES,
    SYNTHETIC_EDGES,
    SYNTHETIC_DATASET_LABEL
)
from app.schemas.network import (
    GraphNode,
    GraphEdge,
    GraphMetrics,
    NetworkGraphData
)
from app.services.case_service import case_service


class NetworkService:
    def __init__(self):
        self._raw_nodes = copy.deepcopy(SYNTHETIC_ENTITIES)
        self._raw_edges = copy.deepcopy(SYNTHETIC_EDGES)
        self._graph = self._build_networkx_graph()

    def _build_networkx_graph(self) -> nx.Graph:
        """Construct a NetworkX Graph from entities and edges."""
        G = nx.Graph()

        # Add nodes with attributes
        for entity in self._raw_nodes:
            G.add_node(
                entity["id"],
                label=entity["name"],
                type=entity["type"],
                risk_score=entity["risk_score"],
                status=entity["status"],
                city=entity.get("city"),
                phone_masked=entity.get("phone_masked"),
                vehicle_number=entity.get("vehicle_number")
            )

        # Add edges with attributes
        for edge in self._raw_edges:
            G.add_edge(
                edge["source"],
                edge["target"],
                id=edge["id"],
                relationship=edge["relationship"],
                label=edge["label"],
                amount_inr=edge.get("amount_inr"),
                frequency=edge.get("frequency"),
                is_suspicious=edge.get("is_suspicious", False),
                weight=edge.get("weight", 1.0)
            )

        return G

    def get_network_graph(self, case_id: str, filter_type: Optional[str] = None) -> NetworkGraphData:
        """Analyze graph structure using NetworkX and return enriched nodes and edges."""
        # Validate that case exists
        case_service.get_case_by_id(case_id)

        G = self._graph

        # Compute topological metrics using NetworkX
        degrees = dict(G.degree())
        degree_centrality = nx.degree_centrality(G)
        betweenness_centrality = nx.betweenness_centrality(G)
        clustering_coeff = nx.clustering(G)
        density = round(float(nx.density(G)), 4)
        node_count = G.number_of_nodes()
        edge_count = G.number_of_edges()
        avg_degree = round(sum(degrees.values()) / max(node_count, 1), 2)

        # Layout coordinates mapping for clean visualization in React frontend
        coords = {
            "ent-1": (380.0, 220.0),
            "ent-2": (200.0, 150.0),
            "ent-3": (540.0, 140.0),
            "ent-4": (500.0, 340.0),
            "ent-5": (220.0, 330.0),
            "ent-v1": (340.0, 380.0),
            "ent-b1": (120.0, 240.0),
        }

        # Cluster groupings
        clusters = {
            "ent-1": "Logistics Core",
            "ent-2": "Financial Link",
            "ent-3": "Corporate Front",
            "ent-4": "Transit Operations",
            "ent-5": "Telecom Relay",
            "ent-v1": "Fleet Asset",
            "ent-b1": "Banking Channel",
        }

        # Build enriched GraphNode list with NetworkX computed metrics
        enriched_nodes = []
        for entity in self._raw_nodes:
            eid = entity["id"]
            if filter_type and entity["type"] != filter_type:
                continue

            x, y = coords.get(eid, (300.0, 300.0))
            node = GraphNode(
                id=eid,
                label=entity["name"],
                type=entity["type"],
                risk_score=entity["risk_score"],
                degree=degrees.get(eid, 0),
                degree_centrality=round(degree_centrality.get(eid, 0.0), 4),
                betweenness_centrality=round(betweenness_centrality.get(eid, 0.0), 4),
                clustering_coefficient=round(clustering_coeff.get(eid, 0.0), 4),
                cluster=clusters.get(eid, "Corridor"),
                status=entity["status"],
                is_hvt=entity["risk_score"] >= 80,
                is_core=True,
                city=entity.get("city"),
                phone_masked=entity.get("phone_masked"),
                vehicle_number=entity.get("vehicle_number"),
                x=x,
                y=y
            )
            enriched_nodes.append(node)

        # Build GraphEdge list
        edges = []
        for edge_data in self._raw_edges:
            edges.append(GraphEdge.model_validate(edge_data))

        metrics = GraphMetrics(
            node_count=node_count,
            edge_count=edge_count,
            density=density,
            average_degree=avg_degree,
            analysis_engine="NetworkX 3.x"
        )

        return NetworkGraphData(
            case_id=case_id,
            nodes=enriched_nodes,
            edges=edges,
            metrics=metrics,
            dataset_label=SYNTHETIC_DATASET_LABEL
        )


# Singleton instance
network_service = NetworkService()
