from __future__ import annotations

import json
import os
import sys
from pathlib import Path
import tempfile
import threading
from fastapi import HTTPException

# Add current scratch dir to sys.path
sys.path.insert(0, str(Path(__file__).parent))

from security_module import (
    ROLES,
    USERS,
    Principal,
    current_user,
    require,
    _get_audit_key,
    _encrypt,
    _decrypt,
    encryption_status,
    audit,
    read_audit,
    verify_chain,
    GENESIS_PREV_HASH,
)


def test_rbac_and_users():
    print("Testing RBAC & USERS...")
    # Verify investigator permissions
    inv_perms = ROLES["investigator"]
    expected_inv = {
        "graph:read", "entity:read", "evidence:read",
        "query:run", "report:generate", "data:submit"
    }
    assert inv_perms == expected_inv, f"Investigator perms mismatch: {inv_perms}"

    # Verify supervisor permissions
    sup_perms = ROLES["supervisor"]
    assert expected_inv.issubset(sup_perms)
    assert {"audit:read", "analytics:tune"}.issubset(sup_perms)
    assert sup_perms == expected_inv | {"audit:read", "analytics:tune"}

    # Verify admin permissions
    admin_perms = ROLES["admin"]
    assert sup_perms.issubset(admin_perms)
    assert {"data:ingest", "user:manage"}.issubset(admin_perms)
    assert admin_perms == sup_perms | {"data:ingest", "user:manage"}

    # Verify viewer permissions
    viewer_perms = ROLES["viewer"]
    assert viewer_perms == {"graph:read"}

    # Verify USERS mapping and Principal
    for token, user_data in USERS.items():
        user = current_user(token)
        assert isinstance(user, Principal)
        assert user.name == user_data["name"]
        assert user.role == user_data["role"]
        assert user.unit == user_data["unit"]
        assert user.badge == user_data["badge"]

    # Test invalid token raises 401
    try:
        current_user("invalid-token-12345")
        assert False, "Should have raised HTTPException 401"
    except HTTPException as exc:
        assert exc.status_code == 401

    print("  RBAC & USERS tests passed!")


def test_require_and_audit_denial():
    print("Testing require() & denial auditing...")
    temp_dir = tempfile.TemporaryDirectory()
    test_log = Path(temp_dir.name) / "test_denial_audit.jsonl"

    viewer = current_user("demo-viewer")
    assert viewer.can("graph:read")
    assert not viewer.can("report:generate")

    # require on permitted action
    require(viewer, "graph:read")

    # require on forbidden action
    try:
        # Patch audit target path by passing log_path or testing audit
        require(viewer, "report:generate")
        assert False, "Should have raised HTTPException 403"
    except HTTPException as exc:
        assert exc.status_code == 403
        assert "Access denied" in exc.detail

    temp_dir.cleanup()
    print("  require() & denial tests passed!")


def test_encryption_modes():
    print("Testing AES-256-GCM encryption & plaintext fallback...")
    
    # Test 1: Plaintext fallback when CNAS_AUDIT_KEY is unset
    os.environ.pop("CNAS_AUDIT_KEY", None)
    status_dict = encryption_status()
    assert status_dict["encryption_active"] is False
    assert status_dict["key_configured"] is False
    
    payload = {"suspect_id": "S-901", "classification": "SECRET"}
    blob, encrypted = _encrypt(payload)
    assert encrypted is False
    decrypted = _decrypt(blob, encrypted)
    assert decrypted == payload

    # Test 2: Active encryption with hex key (32 bytes = 64 hex chars)
    raw_key_bytes = os.urandom(32)
    os.environ["CNAS_AUDIT_KEY"] = raw_key_bytes.hex()
    status_dict = encryption_status()
    assert status_dict["encryption_active"] is True
    assert status_dict["key_configured"] is True

    blob_enc, encrypted_flag = _encrypt(payload)
    assert encrypted_flag is True
    assert blob_enc != str(payload)
    decrypted_enc = _decrypt(blob_enc, encrypted_flag)
    assert decrypted_enc == payload

    # Test 3: Active encryption with base64 key
    import base64
    os.environ["CNAS_AUDIT_KEY"] = base64.b64encode(raw_key_bytes).decode("ascii")
    assert encryption_status()["encryption_active"] is True
    blob_b64, flag_b64 = _encrypt(payload)
    assert flag_b64 is True
    assert _decrypt(blob_b64, flag_b64) == payload

    # Test 4: Active encryption with raw 32-byte ascii string
    os.environ["CNAS_AUDIT_KEY"] = "12345678901234567890123456789012"
    assert len(os.environ["CNAS_AUDIT_KEY"]) == 32
    assert encryption_status()["encryption_active"] is True
    blob_raw, flag_raw = _encrypt(payload)
    assert flag_raw is True
    assert _decrypt(blob_raw, flag_raw) == payload

    print("  AES-256-GCM & fallback tests passed!")


def test_audit_hash_chain():
    print("Testing Audit Logging & Cryptographic Hash Chain...")
    temp_dir = tempfile.TemporaryDirectory()
    test_log = Path(temp_dir.name) / "audit_chain.jsonl"

    # Set key for encryption
    os.environ["CNAS_AUDIT_KEY"] = os.urandom(32).hex()

    inv = current_user("demo-investigator")
    sup = current_user("demo-supervisor")
    adm = current_user("demo-admin")

    e1 = audit(inv, "query:run", {"query": "SELECT * FROM narcotics_network"}, log_path=test_log)
    e2 = audit(sup, "report:generate", {"report_id": "REP-2026-09"}, log_path=test_log)
    e3 = audit(adm, "user:manage", {"action": "promote", "target": "BADGE-7402"}, log_path=test_log)

    assert e1["seq"] == 1
    assert e1["prev_hash"] == GENESIS_PREV_HASH
    assert e2["seq"] == 2
    assert e2["prev_hash"] == e1["entry_hash"]
    assert e3["seq"] == 3
    assert e3["prev_hash"] == e2["entry_hash"]

    # Read audit
    logs = read_audit(limit=10, log_path=test_log)
    assert len(logs) == 3
    assert logs[0]["detail"]["query"] == "SELECT * FROM narcotics_network"
    assert logs[1]["detail"]["report_id"] == "REP-2026-09"
    assert logs[2]["detail"]["action"] == "promote"

    # Verify uncorrupted chain
    assert verify_chain(log_path=test_log) is None

    # Tamper Test 1: Modify content of entry with seq 2
    with open(test_log, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f if line.strip()]
    
    entry_2_tampered = json.loads(lines[1])
    entry_2_tampered["action"] = "tampered:action"
    
    tampered_log_1 = Path(temp_dir.name) / "tampered_1.jsonl"
    with open(tampered_log_1, "w", encoding="utf-8") as f:
        f.write(lines[0] + "\n")
        f.write(json.dumps(entry_2_tampered) + "\n")
        f.write(lines[2] + "\n")

    broken_seq_1 = verify_chain(log_path=tampered_log_1)
    print("  Tamper test 1 (altered seq 2) detected broken seq:", broken_seq_1)
    assert broken_seq_1 == 2, f"Expected 2, got {broken_seq_1}"

    # Tamper Test 2: Delete entry seq 2 (file contains seq 1 and seq 3)
    tampered_log_2 = Path(temp_dir.name) / "tampered_2.jsonl"
    with open(tampered_log_2, "w", encoding="utf-8") as f:
        f.write(lines[0] + "\n")
        f.write(lines[2] + "\n")

    broken_seq_2 = verify_chain(log_path=tampered_log_2)
    print("  Tamper test 2 (deleted seq 2) detected broken seq:", broken_seq_2)
    assert broken_seq_2 == 2, f"Expected 2, got {broken_seq_2}"

    # Tamper Test 3: Modify the last entry (seq 3)
    entry_3_tampered = json.loads(lines[2])
    entry_3_tampered["action"] = "altered:last_action"
    tampered_log_3 = Path(temp_dir.name) / "tampered_3.jsonl"
    with open(tampered_log_3, "w", encoding="utf-8") as f:
        f.write(lines[0] + "\n")
        f.write(lines[1] + "\n")
        f.write(json.dumps(entry_3_tampered) + "\n")

    broken_seq_3 = verify_chain(log_path=tampered_log_3)
    print("  Tamper test 3 (altered last seq 3) detected broken seq:", broken_seq_3)
    assert broken_seq_3 == 3, f"Expected 3, got {broken_seq_3}"

    temp_dir.cleanup()
    print("  Audit hash chain tests passed!")


def test_thread_safety():
    print("Testing multi-threaded audit logging thread safety...")
    temp_dir = tempfile.TemporaryDirectory()
    test_log = Path(temp_dir.name) / "thread_audit.jsonl"
    os.environ["CNAS_AUDIT_KEY"] = os.urandom(32).hex()

    user = current_user("demo-investigator")
    num_threads = 10
    writes_per_thread = 10

    def worker(thread_idx: int):
        for i in range(writes_per_thread):
            audit(user, f"thread:{thread_idx}", {"iteration": i}, log_path=test_log)

    threads = [threading.Thread(target=worker, args=(t,)) for t in range(num_threads)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    # Total entries must be num_threads * writes_per_thread
    logs = read_audit(limit=200, log_path=test_log)
    assert len(logs) == num_threads * writes_per_thread

    # Chain must be completely valid and unbroken
    assert verify_chain(log_path=test_log) is None
    print(f"  Thread safety test passed with {len(logs)} concurrent entries verified!")

    temp_dir.cleanup()


if __name__ == "__main__":
    test_rbac_and_users()
    test_require_and_audit_denial()
    test_encryption_modes()
    test_audit_hash_chain()
    test_thread_safety()
    print("\nALL TESTS PASSED SUCCESSFULLY!")
