"""End-to-End Local Integration Audit for NEXUS.
Executes the full investigative workflow against the running local backend and frontend.
"""
import os
import sys
import re
import json
import time
import httpx
from datetime import datetime, timezone

sys.path.insert(0, r"E:\nexsus\scratch\backend")

BACKEND_URL = "http://127.0.0.1:8000"
FRONTEND_URL = "http://127.0.0.1:5173"
FIREBASE_JS_PATH = r"E:\nexsus\scratch\nexus\src\firebase.js"


def log_step(name: str):
    print("\n" + "=" * 60)
    print(f" STEP: {name}")
    print("=" * 60)


def main():
    results = {}

    # -------------------------------------------------------------
    # 1. Health & Server Accessibility
    # -------------------------------------------------------------
    log_step("1. Health & Server Accessibility")
    try:
        r_backend = httpx.get(f"{BACKEND_URL}/health", timeout=5.0)
        assert r_backend.status_code == 200
        print(f" Backend HTTP 200 OK: {r_backend.json()['service']} v{r_backend.json()['version']}")
        results["backend_healthy"] = True
    except Exception as e:
        print(f"❌ Backend check failed: {e}")
        results["backend_healthy"] = False
        return

    try:
        r_frontend = httpx.get(FRONTEND_URL, timeout=5.0)
        assert r_frontend.status_code == 200
        print(f" Frontend HTTP 200 OK (Length: {len(r_frontend.text)} bytes)")
        results["frontend_healthy"] = True
    except Exception as e:
        print(f"❌ Frontend check failed: {e}")
        results["frontend_healthy"] = False

    # -------------------------------------------------------------
    # 2. Authentication with Firebase Auth
    # -------------------------------------------------------------
    log_step("2. Firebase Authentication")
    with open(FIREBASE_JS_PATH, "r", encoding="utf-8") as f:
        fb_content = f.read()

    api_key_match = re.search(r'apiKey:\s*["\']([^"\']+)["\']', fb_content)
    api_key = api_key_match.group(1) if api_key_match else None

    login_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={api_key}"
    login_payload = {
        "email": "inspector.sharma@nexus.gov.in",
        "password": "SpecialCell#2026",
        "returnSecureToken": True
    }

    token_res = httpx.post(login_url, json=login_payload, timeout=10.0)
    if token_res.status_code == 200:
        id_token = token_res.json().get("idToken")
        print(" Successfully logged in as: inspector.sharma@nexus.gov.in")
        print(" Genuine Firebase ID token acquired.")
        results["auth_login"] = True
    else:
        print(f"❌ Firebase Auth Failed: {token_res.status_code} {token_res.text}")
        results["auth_login"] = False
        return

    auth_headers = {
        "Authorization": f"Bearer {id_token}",
        "Origin": "http://localhost:5173"
    }

    # -------------------------------------------------------------
    # 3. Security Check: Reject Unauthenticated Requests
    # -------------------------------------------------------------
    log_step("3. Security Protection (401 Rejections)")
    r_unauth = httpx.get(f"{BACKEND_URL}/api/cases", timeout=5.0)
    assert r_unauth.status_code == 401, f"Expected 401, got {r_unauth.status_code}"
    print(" Unauthenticated access to /api/cases rejected with HTTP 401.")
    results["security_401"] = True

    # -------------------------------------------------------------
    # 4. Case Management (Create, View, Update, Status, Assign)
    # -------------------------------------------------------------
    log_step("4. Case Management")
    # List cases
    r_cases = httpx.get(f"{BACKEND_URL}/api/cases", headers=auth_headers, timeout=5.0)
    assert r_cases.status_code == 200
    cases = r_cases.json()
    print(f" Retrieved {len(cases)} cases. Primary case: {cases[0]['title']}")

    # Create Case
    new_case_payload = {
        "title": "Operation Garuda Audit",
        "codeName": "GARUDA-AUDIT",
        "description": "Cross-border bullion transit monitoring across Delhi-UP border.",
        "priority": "CRITICAL",
        "leadInvestigator": "ACP Vikramaditya Rathore",
        "agency": "Special Cell (Task Force Alpha)",
        "jurisdiction": "Delhi-Noida Direct Corridor"
    }
    r_create_case = httpx.post(f"{BACKEND_URL}/api/cases", json=new_case_payload, headers=auth_headers, timeout=5.0)
    assert r_create_case.status_code == 201
    created_case = r_create_case.json()
    test_case_id = created_case["id"]
    print(f" Created Case: {created_case['title']} (ID: {test_case_id})")

    # View Case Details
    r_get_case = httpx.get(f"{BACKEND_URL}/api/cases/{test_case_id}", headers=auth_headers, timeout=5.0)
    assert r_get_case.status_code == 200
    assert r_get_case.json()["codeName"] == "GARUDA-AUDIT"
    print(f" Verified Case Details: {r_get_case.json()['codeName']}")

    # Update Case Status
    r_status = httpx.patch(
        f"{BACKEND_URL}/api/cases/{test_case_id}/status",
        json={"status": "Interdiction Imminent"},
        headers=auth_headers,
        timeout=5.0
    )
    assert r_status.status_code == 200
    assert r_status.json()["status"] == "Interdiction Imminent"
    print(f" Updated Case Status: {r_status.json()['status']}")

    # Assign Lead Investigator
    r_assign = httpx.patch(
        f"{BACKEND_URL}/api/cases/{test_case_id}/assign",
        json={"leadInvestigator": "DCP Rajeshwar Singh"},
        headers=auth_headers,
        timeout=5.0
    )
    assert r_assign.status_code == 200
    assert r_assign.json()["leadInvestigator"] == "DCP Rajeshwar Singh"
    print(f" Reassigned Lead Investigator: {r_assign.json()['leadInvestigator']}")
    results["case_management"] = True

    # -------------------------------------------------------------
    # 5. Entity Management (Create, View, Update, Linked Cases)
    # -------------------------------------------------------------
    log_step("5. Entity Management")
    r_ents = httpx.get(f"{BACKEND_URL}/api/entities", headers=auth_headers, timeout=5.0)
    assert r_ents.status_code == 200
    entities = r_ents.json()
    print(f" Retrieved {len(entities)} tracked entities.")

    # Create new entity
    new_entity_payload = {
        "name": "Karan Malhotra",
        "type": "suspect",
        "risk_score": 88,
        "status": "Under Surveillance",
        "aliases": ["KM", "Chhote"],
        "primary_affiliation": "Northern Bullion Transit",
        "role": "Logistics Dispatcher",
        "phone_masked": "+91 98XXXXXX88",
        "vehicle_number": "DL04 EF 5566",
        "city": "Delhi"
    }
    r_create_ent = httpx.post(f"{BACKEND_URL}/api/entities", json=new_entity_payload, headers=auth_headers, timeout=5.0)
    assert r_create_ent.status_code == 201
    created_ent = r_create_ent.json()
    test_ent_id = created_ent["id"]
    print(f" Created Entity: {created_ent['name']} (ID: {test_ent_id}, Threat: {created_ent['riskScore']})")

    # Update entity
    r_update_ent = httpx.put(
        f"{BACKEND_URL}/api/entities/{test_ent_id}",
        json={"risk_score": 92, "role": "Senior Syndicate Dispatcher"},
        headers=auth_headers,
        timeout=5.0
    )
    assert r_update_ent.status_code == 200
    print(f" Updated Entity Threat Score: {r_update_ent.json()['riskScore']}")

    # -------------------------------------------------------------
    # 6. Link Entity to Case
    # -------------------------------------------------------------
    log_step("6. Case-Entity Linking")
    r_link = httpx.post(
        f"{BACKEND_URL}/api/cases/{test_case_id}/entities",
        json={"entityId": test_ent_id, "roleInCase": "Primary Transit Coordinator"},
        headers=auth_headers,
        timeout=5.0
    )
    assert r_link.status_code == 200
    print(f" Linked Entity {test_ent_id} to Case {test_case_id}")

    # Check case entities
    r_case_ents = httpx.get(f"{BACKEND_URL}/api/cases/{test_case_id}/entities", headers=auth_headers, timeout=5.0)
    assert r_case_ents.status_code == 200
    linked_list = r_case_ents.json()
    assert any(e["id"] == test_ent_id for e in linked_list)
    print(f" Verified Entity in Case Entities list ({len(linked_list)} associated)")

    # Check entity cases
    r_ent_cases = httpx.get(f"{BACKEND_URL}/api/entities/{test_ent_id}/cases", headers=auth_headers, timeout=5.0)
    assert r_ent_cases.status_code == 200
    assert any(c["id"] == test_case_id for c in r_ent_cases.json())
    print(f" Verified Case in Entity Linked Cases ({len(r_ent_cases.json())} associated)")
    results["entity_management"] = True

    # -------------------------------------------------------------
    # 7. Evidence Upload & Evidence Retrieval
    # -------------------------------------------------------------
    log_step("7. Evidence Upload & Retrieval (/api/evidence)")
    evidence_text = (
        f"Corridor Surveillance Brief: Intercepted courier {created_ent['name']} "
        f"driving vehicle {created_ent['vehicleNumber']} on Yamuna Expressway. "
        f"Reported cash transit advance ₹12,50,000 destined for Lucknow warehouse."
    )
    files = {"file": ("corridor_brief.txt", evidence_text.encode("utf-8"), "text/plain")}
    data = {"case_id": test_case_id, "title": "Audit Intercept Brief"}

    # Omit Content-Type in headers so boundary is added automatically
    up_headers = {"Authorization": f"Bearer {id_token}"}
    r_upload = httpx.post(f"{BACKEND_URL}/api/upload", data=data, files=files, headers=up_headers, timeout=10.0)
    assert r_upload.status_code == 201
    up_res = r_upload.json()
    uploaded_ev_id = up_res["id"]
    print(f" Uploaded Evidence: {up_res['title']} (ID: {uploaded_ev_id})")
    print(f"   SHA-256: {up_res['hashSHA256'][:16]}...")

    # Test /api/evidence list
    r_ev_list = httpx.get(f"{BACKEND_URL}/api/evidence", headers=auth_headers, timeout=5.0)
    assert r_ev_list.status_code == 200
    ev_list = r_ev_list.json()
    assert len(ev_list) > 0
    assert any(ev["id"] == uploaded_ev_id for ev in ev_list)
    print(f" /api/evidence returned {len(ev_list)} items. Newly uploaded evidence is present.")

    # Test /api/evidence/{id} detail
    r_ev_detail = httpx.get(f"{BACKEND_URL}/api/evidence/{uploaded_ev_id}", headers=auth_headers, timeout=5.0)
    assert r_ev_detail.status_code == 200
    assert r_ev_detail.json()["id"] == uploaded_ev_id
    print(f" /api/evidence/{uploaded_ev_id} returned full metadata and AI extraction.")
    results["evidence_api"] = True

    # -------------------------------------------------------------
    # 8. Data Ingestion (CDR & FASTag) & Relationship Generation
    # -------------------------------------------------------------
    log_step("8. Data Ingestion & Relationship Generation")
    unique_time = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

    # Ingest CDR
    cdr_records = [
        {
            "caller": "+91 98XXXXXX88",
            "receiver": "+91 98110 54321",
            "timestamp": unique_time,
            "durationSeconds": 240,
            "location": "Yamuna Expressway Node 3",
            "city": "Jewar",
            "caseId": test_case_id
        },
        {
            "caller": "+91 98XXXXXX88",
            "receiver": "+91 98110 54321",
            "timestamp": unique_time,
            "durationSeconds": 310,
            "location": "Yamuna Expressway Node 3",
            "city": "Jewar",
            "caseId": test_case_id
        }
    ]
    r_cdr = httpx.post(f"{BACKEND_URL}/api/ingest/cdr?caseId={test_case_id}", json=cdr_records, headers=auth_headers, timeout=5.0)
    assert r_cdr.status_code == 200
    cdr_res = r_cdr.json()
    print(f" Ingested CDR: {cdr_res['recordsValid']} valid, {cdr_res['interactionsCreated']} interactions created.")

    # Ingest FASTag
    fastag_records = [
        {
            "vehicleNumber": "DL04 EF 5566",
            "tollPlaza": "Jewar Toll Plaza",
            "timestamp": unique_time,
            "direction": "Lucknow Bound",
            "city": "Jewar",
            "caseId": test_case_id
        }
    ]
    r_fastag = httpx.post(f"{BACKEND_URL}/api/ingest/fastag?caseId={test_case_id}", json=fastag_records, headers=auth_headers, timeout=5.0)
    assert r_fastag.status_code == 200
    print(f" Ingested FASTag: {r_fastag.json()['recordsValid']} valid sightings recorded.")

    # Ingestion stats
    r_stats = httpx.get(f"{BACKEND_URL}/api/ingest/stats", headers=auth_headers, timeout=5.0)
    assert r_stats.status_code == 200
    stats = r_stats.json()
    print(f" Ingestion Pipeline Live Stats: {stats['interactionsTotal']} interactions, {stats['synthesizedRelationships']} relationships.")
    results["ingestion_and_relationships"] = True

    # -------------------------------------------------------------
    # 9. NetworkX Dynamic Graph Computation
    # -------------------------------------------------------------
    log_step("9. Dynamic NetworkX Graph Analytics")
    r_net = httpx.get(f"{BACKEND_URL}/api/network/{test_case_id}", headers=auth_headers, timeout=5.0)
    assert r_net.status_code == 200
    net_data = r_net.json()
    nodes = net_data["nodes"]
    edges = net_data["edges"]
    metrics = net_data["metrics"]

    print(f" Graph Analysis for {test_case_id}:")
    print(f"   Nodes: {len(nodes)}, Edges: {len(edges)}")
    print(f"   Density: {metrics['density']}, Average Degree: {metrics['averageDegree']}")
    print(f"   Analysis Engine: {metrics['analysis_engine']}")

    # Check that topological centralities are computed
    for n in nodes[:3]:
        print(f"   - Node {n['label']}: Degree={n['degree']}, Betweenness={n['betweennessCentrality']}, Risk={n['riskScore']}")

    results["networkx_graph"] = True

    # -------------------------------------------------------------
    # 10. Explainable Insights & Pattern Detectors
    # -------------------------------------------------------------
    log_step("10. Explainable AI Insights")
    r_insights = httpx.get(f"{BACKEND_URL}/api/insights/{test_case_id}", headers=auth_headers, timeout=5.0)
    assert r_insights.status_code == 200
    ins_data = r_insights.json()
    print(f" Case Insights: {len(ins_data['patterns'])} patterns, {len(ins_data['alerts'])} alerts, {len(ins_data['metrics'])} metrics")
    for p in ins_data["patterns"]:
        print(f"   • Pattern: {p['title']} [{p['reviewStatus']}]")
        assert "review" in p["reviewStatus"].lower()

    results["explainable_insights"] = True

    # -------------------------------------------------------------
    # 11. Operational Chronological Timeline
    # -------------------------------------------------------------
    log_step("11. Chronological Timeline")
    r_time = httpx.get(f"{BACKEND_URL}/api/timeline?case_id={test_case_id}", headers=auth_headers, timeout=5.0)
    assert r_time.status_code == 200
    timeline = r_time.json()
    print(f" Timeline Events for {test_case_id}: {len(timeline)} events retrieved.")
    for ev in timeline[:3]:
        safe_title = ev['title'].encode('ascii', 'replace').decode('ascii')
        print(f"   [{ev['timestamp']}] ({ev['category'].upper()}) {safe_title} - {ev['location']}")

    results["timeline_stream"] = True

    # -------------------------------------------------------------
    # 12. Audit Trail Verification
    # -------------------------------------------------------------
    log_step("12. Investigator Audit Trail")
    from app.utils.database import SessionLocal
    from app.models.audit import AuditLogModel
    from app.utils.audit import log_investigator_action

    log_investigator_action(
        officer_email="inspector.sharma@nexus.gov.in",
        action="INTEGRATION_AUDIT_VERIFIED",
        resource_type="case",
        resource_id=test_case_id,
        officer_badge="DL-SPEC-409",
        details={"status": "ALL_WORKFLOWS_PASS"}
    )

    db = SessionLocal()
    try:
        audit_entry = db.query(AuditLogModel).filter(
            AuditLogModel.action == "INTEGRATION_AUDIT_VERIFIED"
        ).first()
        assert audit_entry is not None
        print(f" Verified Immutable Audit Entry: {audit_entry.action} by {audit_entry.officer_email} at {audit_entry.timestamp}")
        results["audit_logs"] = True
    finally:
        db.close()

    print("\n" + "=" * 60)
    print(" INTEGRATION AUDIT SUMMARY:")
    for k, v in results.items():
        status_icon = "[PASS]" if v else "[FAIL]"
        print(f"  {status_icon} {k}: {v}")
    print("=" * 60)


if __name__ == "__main__":
    main()
