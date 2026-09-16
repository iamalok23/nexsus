"""Audit logging utility for immutable record of investigator activity."""
from datetime import datetime, timezone
from typing import Optional, Dict, Any
import uuid

from app.models.audit import AuditLogModel
from app.utils.database import SessionLocal


def log_investigator_action(
    officer_email: str,
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    officer_badge: Optional[str] = None,
    ip_address: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None
):
    """Record an investigator action to the immutable audit log table."""
    db = SessionLocal()
    try:
        log_id = f"audit-{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc).isoformat()
        entry = AuditLogModel(
            id=log_id,
            officer_email=officer_email or "unknown@nexus.gov.in",
            officer_badge=officer_badge or "INVESTIGATOR",
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            timestamp=now,
            ip_address=ip_address,
            details=details or {}
        )
        db.add(entry)
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()
