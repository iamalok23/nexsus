"""Network Graph API router."""
from typing import Optional
from fastapi import APIRouter, Query
from app.schemas.network import NetworkGraphData
from app.services.network_service import network_service

router = APIRouter(prefix="/network", tags=["Network Analysis"])


@router.get(
    "/{case_id}",
    response_model=NetworkGraphData,
    summary="Get Case Network Graph Data",
    description=(
        "Returns the relationship graph for a case. Nodes and edges are computed and "
        "enriched using NetworkX with degree, betweenness centrality, and clustering metrics."
    )
)
async def get_network(
    case_id: str,
    filter_type: Optional[str] = Query(None, description="Optional entity type filter (e.g., 'subject_of_interest', 'vehicle')")
):
    return network_service.get_network_graph(case_id, filter_type=filter_type)
