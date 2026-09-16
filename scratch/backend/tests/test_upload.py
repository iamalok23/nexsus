"""Automated Test Suite for Upload Endpoint (Phase 2)."""
import sys
import os
import io
import json
import hashlib

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.utils.auth import get_current_user

app.dependency_overrides[get_current_user] = lambda: {"uid": "test-officer", "email": "officer@nexus.gov.in"}
client = TestClient(app)


def test_upload_txt_file():
    """Verify TXT file upload computes SHA256 and extracts Indian synthetic entities."""
    sample_text = (
        "Internal Logistics Brief: Rahul Verma instructed Amit Yadav on line +91 97XXXXXX45 "
        "to dispatch vehicle UP14 AB 1234 via Jewar Toll Plaza towards Lucknow. "
        "Estimated advance clearance: ₹12,50,000."
    )
    expected_hash = hashlib.sha256(sample_text.encode("utf-8")).hexdigest()

    file_obj = io.BytesIO(sample_text.encode("utf-8"))
    files = {"file": ("dispatch_memo.txt", file_obj, "text/plain")}
    data = {"case_id": "case-sih-01", "title": "Dispatch Coordination Memo"}

    response = client.post("/api/upload", files=files, data=data)
    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"

    res = response.json()
    assert res["hashSHA256"] == expected_hash
    assert res["fileDetails"]["format"] == "txt"
    assert res["fileDetails"]["filename"] == "dispatch_memo.txt"
    assert res["reviewStatus"] == "Requires Human Review"
    assert res["dataset_label"] == "Synthetic Investigation Dataset"

    # Check extraction
    extraction = res["extraction"]
    assert "+91 97XXXXXX45" in extraction["phoneNumbers"]
    assert "UP14 AB 1234" in extraction["vehicleNumbers"]
    assert any("12,50,000" in amt for amt in extraction["currencyAmounts"])
    names = [e["name"] for e in extraction["entities"]]
    assert "Rahul Verma" in names or "Amit Yadav" in names
    print(f"PASS: test_upload_txt_file (SHA256: {expected_hash[:16]}...)")


def test_upload_csv_file():
    """Verify CSV file upload."""
    csv_content = (
        "timestamp,vehicle_number,toll_plaza,direction\n"
        "2026-09-07T19:15:00Z,UP14 AB 1234,Jewar Toll Plaza,Lucknow Bound\n"
        "2026-09-07T19:33:00Z,DL01 CA 9988,Jewar Toll Plaza,Lucknow Bound\n"
    )
    file_obj = io.BytesIO(csv_content.encode("utf-8"))
    files = {"file": ("anpr_logs.csv", file_obj, "text/csv")}

    response = client.post("/api/upload", files=files)
    assert response.status_code == 201
    res = response.json()
    assert res["fileDetails"]["format"] == "csv"
    assert "UP14 AB 1234" in res["extraction"]["vehicleNumbers"]
    print("PASS: test_upload_csv_file")


def test_upload_json_file():
    """Verify JSON file upload."""
    json_data = [
        {"account": "Canara Bank #0492", "signatory": "Priya Singh", "amount": "₹5,20,000"},
        {"account": "Apex Holding", "signatory": "Rahul Verma", "amount": "₹7,30,000"}
    ]
    file_obj = io.BytesIO(json.dumps(json_data).encode("utf-8"))
    files = {"file": ("ledger_audit.json", file_obj, "application/json")}

    response = client.post("/api/upload", files=files)
    assert response.status_code == 201
    res = response.json()
    assert res["fileDetails"]["format"] == "json"
    names = [e["name"] for e in res["extraction"]["entities"]]
    assert "Priya Singh" in names or "Rahul Verma" in names
    print("PASS: test_upload_json_file")


def test_upload_unsupported_file():
    """Verify unsupported file formats (e.g. PDF, EXE) are rejected with 400."""
    dummy_pdf = b"%PDF-1.4 dummy pdf binary data"
    file_obj = io.BytesIO(dummy_pdf)
    files = {"file": ("court_order.pdf", file_obj, "application/pdf")}

    response = client.post("/api/upload", files=files)
    assert response.status_code == 400
    err = response.json()
    assert err["success"] is False
    assert err["error"]["type"] == "InvalidUploadError"
    assert "not supported in this prototype" in err["error"]["message"]
    print("PASS: test_upload_unsupported_file (Properly rejected PDF)")


if __name__ == "__main__":
    print("--- RUNNING UPLOAD ENDPOINT TESTS ---")
    test_upload_txt_file()
    test_upload_csv_file()
    test_upload_json_file()
    test_upload_unsupported_file()
    print("--- ALL UPLOAD TESTS PASSED SUCCESSFULLY! ---")
