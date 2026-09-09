from __future__ import annotations

import base64
from dataclasses import dataclass
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import threading
from typing import Any, NamedTuple

# FastAPI imports
from fastapi import Header, HTTPException, status

# Cryptography AEAD import with graceful fallback
try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    HAS_CRYPTOGRAPHY = True
except ImportError:  # pragma: no cover
    AESGCM = None
    HAS_CRYPTOGRAPHY = False

# =====================================================================
# 1. Role-Based Access Control (RBAC) & Authentication
# =====================================================================

INVESTIGATOR_PERMS: set[str] = {
    "graph:read",
    "entity:read",
    "evidence:read",
    "query:run",
    "report:generate",
    "data:submit",
}

SUPERVISOR_PERMS: set[str] = INVESTIGATOR_PERMS | {
    "audit:read",
    "analytics:tune",
}

ADMIN_PERMS: set[str] = SUPERVISOR_PERMS | {
    "data:ingest",
    "user:manage",
}

VIEWER_PERMS: set[str] = {
    "graph:read",
}

ROLES: dict[str, set[str]] = {
    "investigator": INVESTIGATOR_PERMS,
    "supervisor": SUPERVISOR_PERMS,
    "admin": ADMIN_PERMS,
    "viewer": VIEWER_PERMS,
}

USERS: dict[str, dict[str, str]] = {
    "demo-investigator": {
        "name": "Det. Sarah Miller",
        "role": "investigator",
        "unit": "Major Narcotics Task Force",
        "badge": "BADGE-7402",
    },
    "demo-supervisor": {
        "name": "Lt. Marcus Vance",
        "role": "supervisor",
        "unit": "Special Investigations Division",
        "badge": "BADGE-3319",
    },
    "demo-admin": {
        "name": "Chief Elena Rostova",
        "role": "admin",
        "unit": "Intelligence & Cyber Operations",
        "badge": "BADGE-1001",
    },
    "demo-viewer": {
        "name": "Analyst David Park",
        "role": "viewer",
        "unit": "Criminal Intelligence Bureau",
        "badge": "BADGE-9082",
    },
}


@dataclass(frozen=True)
class Principal:
    name: str
    role: str
    unit: str
    badge: str
    token: str | None = None

    def can(self, permission: str) -> bool:
        """Check whether the principal's role grants the requested permission."""
        role_perms = ROLES.get(self.role, set())
        return permission in role_perms

    def to_dict(self) -> dict[str, str]:
        """Convert principal identity details to a dictionary."""
        return {
            "name": self.name,
            "role": self.role,
            "unit": self.unit,
            "badge": self.badge,
        }


def current_user(x_auth_token: str = Header(..., alias="X-Auth-Token")) -> Principal:
    """
    FastAPI dependency to authenticate and resolve the current user Principal
    from the X-Auth-Token HTTP header. Raises HTTP 401 if token is invalid or missing.
    """
    if not x_auth_token or x_auth_token not in USERS:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed: invalid or unrecognized authorization token.",
            headers={"WWW-Authenticate": "X-Auth-Token"},
        )

    user_info = USERS[x_auth_token]
    return Principal(
        name=user_info["name"],
        role=user_info["role"],
        unit=user_info["unit"],
        badge=user_info["badge"],
        token=x_auth_token,
    )


def require(principal: Principal, permission: str) -> None:
    """
    Validate that the principal has the specified permission.
    If denied, an audit entry is automatically written and an HTTP 403 exception is raised.
    """
    if not principal.can(permission):
        # Log unauthorized access attempt in tamper-evident audit log
        audit(
            principal=principal,
            action="auth:permission_denied",
            detail={
                "attempted_permission": permission,
                "role": principal.role,
                "badge": principal.badge,
                "status": "DENIED",
                "reason": f"Role '{principal.role}' lacks permission '{permission}'",
            },
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: permission '{permission}' required for role '{principal.role}'.",
        )


# =====================================================================
# 2. AES-256-GCM At-Rest Encryption
# =====================================================================

class EncryptedPayload(NamedTuple):
    blob: str
    encrypted: bool


def _get_audit_key() -> bytes | None:
    """
    Extract a 32-byte (256-bit) encryption key from the CNAS_AUDIT_KEY environment variable.
    Supports 64-character hex strings, 44-character base64 strings, or raw 32-byte UTF-8 strings.
    Returns None if missing, invalid length, or if the cryptography library is not installed.
    """
    if not HAS_CRYPTOGRAPHY or AESGCM is None:
        return None

    raw = os.environ.get("CNAS_AUDIT_KEY")
    if not raw:
        return None

    raw = raw.strip()

    # 1. 64-char hex format
    if len(raw) == 64:
        try:
            key_bytes = bytes.fromhex(raw)
            if len(key_bytes) == 32:
                return key_bytes
        except ValueError:
            pass

    # 2. Base64 format
    try:
        decoded = base64.b64decode(raw, validate=True)
        if len(decoded) == 32:
            return decoded
    except Exception:
        pass

    # 3. Raw 32-byte string
    encoded = raw.encode("utf-8")
    if len(encoded) == 32:
        return encoded

    return None


def _encrypt(payload: dict[str, Any]) -> EncryptedPayload:
    """
    Encrypt a payload dictionary using AES-256-GCM.
    Falls back to plaintext JSON if CNAS_AUDIT_KEY or cryptography is unavailable.
    Returns an EncryptedPayload(blob: str, encrypted: bool).
    """
    key = _get_audit_key()
    serialized = json.dumps(payload, sort_keys=True, separators=(",", ":"))

    if key is None or not HAS_CRYPTOGRAPHY or AESGCM is None:
        return EncryptedPayload(blob=serialized, encrypted=False)

    # Generate standard 12-byte (96-bit) GCM nonce
    nonce = os.urandom(12)
    aesgcm = AESGCM(key)
    # encrypt returns ciphertext + 16-byte GCM authentication tag
    ciphertext = aesgcm.encrypt(nonce, serialized.encode("utf-8"), associated_data=None)
    # Pack nonce + ciphertext/tag and encode to base64 string
    blob = base64.b64encode(nonce + ciphertext).decode("ascii")
    return EncryptedPayload(blob=blob, encrypted=True)


def _decrypt(blob: str, encrypted: bool) -> dict[str, Any]:
    """
    Decrypt an audit log payload blob.
    If encrypted is False, parses the blob as JSON.
    If encrypted is True, decrypts using AES-256-GCM with the key from CNAS_AUDIT_KEY.
    Raises ValueError if decryption fails or if key/library is unavailable.
    """
    if not encrypted:
        try:
            return json.loads(blob)
        except Exception as exc:
            raise ValueError(f"Failed to decode plaintext JSON audit blob: {exc}") from exc

    key = _get_audit_key()
    if key is None or not HAS_CRYPTOGRAPHY or AESGCM is None:
        raise ValueError(
            "Audit payload is encrypted, but encryption key (CNAS_AUDIT_KEY) or cryptography library is unavailable."
        )

    try:
        raw_data = base64.b64decode(blob.encode("ascii"), validate=True)
        if len(raw_data) < 28:  # 12-byte nonce + 16-byte minimum auth tag
            raise ValueError("Encrypted blob is too short for AES-256-GCM ciphertext.")
        nonce = raw_data[:12]
        ciphertext = raw_data[12:]
        aesgcm = AESGCM(key)
        plaintext = aesgcm.decrypt(nonce, ciphertext, associated_data=None)
        return json.loads(plaintext.decode("utf-8"))
    except Exception as exc:
        raise ValueError(f"AES-256-GCM payload decryption failed: {exc}") from exc


def encryption_status() -> dict[str, Any]:
    """
    Return the current status of at-rest audit encryption.
    """
    key = _get_audit_key()
    key_configured = key is not None
    active = HAS_CRYPTOGRAPHY and key_configured
    return {
        "encryption_active": active,
        "library_available": HAS_CRYPTOGRAPHY,
        "key_configured": key_configured,
        "algorithm": "AES-256-GCM" if active else "plaintext_fallback",
        "env_var": "CNAS_AUDIT_KEY",
    }


# =====================================================================
# 3. Tamper-Evident Audit Logging (Hash Chain)
# =====================================================================

AUDIT_LOG_FILE: Path = Path("audit_log.jsonl")
GENESIS_PREV_HASH: str = "0" * 64
_LOG_LOCK = threading.Lock()


def _compute_hash(entry: dict[str, Any]) -> str:
    """
    Compute deterministic SHA-256 hash of an entry based on all its fields
    excluding 'entry_hash'.
    """
    hashable_data = {k: v for k, v in entry.items() if k != "entry_hash"}
    canonical = json.dumps(hashable_data, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def audit(
    principal: Principal | dict[str, Any] | None,
    action: str,
    detail: dict[str, Any],
    log_path: Path | str | None = None,
) -> dict[str, Any]:
    """
    Write a tamper-evident, cryptographically chained audit log entry.
    Thread-safe write guarded by threading.Lock().
    The detail dictionary is encrypted using _encrypt.
    """
    target_path = Path(log_path) if log_path else AUDIT_LOG_FILE

    # Normalize user details
    if isinstance(principal, Principal):
        user_info = principal.to_dict()
    elif isinstance(principal, dict):
        user_info = {
            "name": str(principal.get("name", "Unknown")),
            "role": str(principal.get("role", "unknown")),
            "unit": str(principal.get("unit", "unknown")),
            "badge": str(principal.get("badge", "N/A")),
        }
    else:
        user_info = {
            "name": "SYSTEM",
            "role": "system",
            "unit": "KERNEL",
            "badge": "SYS-0000",
        }

    # Encrypt the detail payload
    encrypted_payload = _encrypt(detail)

    with _LOG_LOCK:
        # Determine current sequence number and prev_hash
        prev_hash = GENESIS_PREV_HASH
        next_seq = 1

        if target_path.exists() and target_path.stat().st_size > 0:
            with open(target_path, "r", encoding="utf-8") as f:
                lines = [line.strip() for line in f if line.strip()]
                if lines:
                    last_entry = json.loads(lines[-1])
                    next_seq = int(last_entry["seq"]) + 1
                    prev_hash = str(last_entry["entry_hash"])

        timestamp = datetime.now(timezone.utc).isoformat()

        entry_data: dict[str, Any] = {
            "seq": next_seq,
            "timestamp": timestamp,
            "action": action,
            "user": user_info,
            "detail": encrypted_payload.blob,
            "encrypted": encrypted_payload.encrypted,
            "prev_hash": prev_hash,
        }

        entry_hash = _compute_hash(entry_data)
        entry_data["entry_hash"] = entry_hash

        # Append to jsonl file
        with open(target_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry_data, sort_keys=True) + "\n")

    return entry_data


def read_audit(limit: int = 100, log_path: Path | str | None = None) -> list[dict[str, Any]]:
    """
    Read the latest audit log entries from the JSONL file, decrypting
    the 'detail' payload for each entry.
    """
    target_path = Path(log_path) if log_path else AUDIT_LOG_FILE
    if not target_path.exists():
        return []

    with _LOG_LOCK:
        with open(target_path, "r", encoding="utf-8") as f:
            lines = [line.strip() for line in f if line.strip()]

    target_lines = lines[-limit:] if limit > 0 else []
    results = []

    for line in target_lines:
        raw_entry = json.loads(line)
        blob = raw_entry.get("detail", "")
        encrypted_flag = raw_entry.get("encrypted", False)

        try:
            decrypted_detail = _decrypt(blob, encrypted_flag)
        except Exception as exc:
            decrypted_detail = {"_decryption_error": str(exc), "_raw_blob": blob}

        entry = dict(raw_entry)
        entry["detail"] = decrypted_detail
        results.append(entry)

    return results


def verify_chain(log_path: Path | str | None = None) -> int | None:
    """
    Iterate through the entire JSONL file, hash each entry, and compare it
    to the next entry's prev_hash.
    If a mismatch is found (indicating tampering, alteration, or deletion),
    returns exactly which sequence number broke the chain.
    Returns None if the chain is completely intact and valid.
    """
    target_path = Path(log_path) if log_path else AUDIT_LOG_FILE
    if not target_path.exists():
        return None

    with _LOG_LOCK:
        with open(target_path, "r", encoding="utf-8") as f:
            lines = [line.strip() for line in f if line.strip()]

    if not lines:
        return None

    entries = [json.loads(line) for line in lines]

    # Verify Genesis entry
    genesis = entries[0]
    if genesis.get("seq") != 1:
        return genesis.get("seq", 1)

    if genesis.get("prev_hash") != GENESIS_PREV_HASH:
        return genesis.get("seq", 1)

    if _compute_hash(genesis) != genesis.get("entry_hash"):
        return genesis.get("seq", 1)

    # Verify each consecutive pair
    for i in range(len(entries) - 1):
        curr_entry = entries[i]
        next_entry = entries[i + 1]

        # 1. Check if current entry was modified in-place
        curr_computed_hash = _compute_hash(curr_entry)
        if curr_computed_hash != curr_entry.get("entry_hash"):
            return curr_entry.get("seq", i + 1)

        # 2. Check for sequence gaps (deletion)
        expected_next_seq = curr_entry.get("seq", 0) + 1
        if next_entry.get("seq") != expected_next_seq:
            return expected_next_seq

        # 3. Hash current entry and compare to next entry's prev_hash
        if curr_computed_hash != next_entry.get("prev_hash"):
            return curr_entry.get("seq", i + 1)

    # Verify final entry
    last_entry = entries[-1]
    if _compute_hash(last_entry) != last_entry.get("entry_hash"):
        return last_entry.get("seq", len(entries))

    return None
