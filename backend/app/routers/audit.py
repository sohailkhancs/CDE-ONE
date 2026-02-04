"""
Audit logging router for ISO 19650 compliance.

ISO 19650 requires a comprehensive audit trail for:
- All document accesses (view, download)
- All document modifications (upload, update, delete)
- All state transitions (workflow promotions)
- All authentication events (login, logout)
- All permission denials
"""
from datetime import datetime
from typing import List, Optional
import os

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.routers.auth import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/audit", tags=["Audit"])

# Audit log directory
AUDIT_LOG_DIR = "audit_logs"
os.makedirs(AUDIT_LOG_DIR, exist_ok=True)


class AuditEntry(BaseModel):
    """Schema for audit log entries from frontend."""
    timestamp: str
    action: str
    user: dict
    resource: dict
    outcome: dict
    details: Optional[dict] = None


class AuditQuery(BaseModel):
    """Schema for querying audit logs."""
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    user_id: Optional[str] = None
    action: Optional[str] = None
    resource_type: Optional[str] = None
    limit: int = 100


@router.post("/log")
async def create_audit_log(
    entry: AuditEntry,
    current_user: User = Depends(get_current_active_user)
):
    """
    Receive audit log entry from frontend.

    This endpoint receives audit events from the frontend for
    comprehensive tracking of user actions per ISO 19650 requirements.
    """
    log_file = os.path.join(
        AUDIT_LOG_DIR,
        f"audit_{datetime.utcnow().strftime('%Y%m%d')}.log"
    )

    try:
        import json
        with open(log_file, "a") as f:
            # Verify the user ID matches the authenticated user
            if entry.user.get("id") != current_user.id:
                # Override with actual authenticated user info
                entry.user = {
                    "id": current_user.id,
                    "email": current_user.email,
                    "role": current_user.role
                }

            f.write(json.dumps(entry.model_dump()) + "\n")

        return {"status": "logged"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to write audit log: {str(e)}"
        )


@router.post("/batch")
async def batch_audit_logs(
    entries: List[AuditEntry],
    current_user: User = Depends(get_current_active_user)
):
    """
    Receive multiple audit log entries from frontend.
    Used for syncing accumulated logs.
    """
    log_file = os.path.join(
        AUDIT_LOG_DIR,
        f"audit_{datetime.utcnow().strftime('%Y%m%d')}.log"
    )

    try:
        import json
        with open(log_file, "a") as f:
            for entry in entries:
                # Verify the user ID matches the authenticated user
                if entry.user.get("id") != current_user.id:
                    entry.user = {
                        "id": current_user.id,
                        "email": current_user.email,
                        "role": current_user.role
                    }
                f.write(json.dumps(entry.model_dump()) + "\n")

        return {"status": "logged", "count": len(entries)}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to write audit logs: {str(e)}"
        )


@router.get("/logs")
async def get_audit_logs(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    user_id: Optional[str] = None,
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieve audit logs.

    Only Admin users can access full audit logs.
    Project Managers can only see logs for their own actions.
    """
    # RBAC: Only Admin can view all audit logs
    if current_user.role != "Admin":
        raise HTTPException(
            status_code=403,
            detail="Only Admin users can view audit logs"
        )

    logs = []
    log_dir = AUDIT_LOG_DIR

    # Determine date range for log files to read
    from datetime import timedelta

    if not end_date:
        end_date = datetime.utcnow().strftime("%Y%m%d")
    if not start_date:
        start_date = (datetime.utcnow() - timedelta(days=30)).strftime("%Y%m%d")

    # Read log files within date range
    current = start_date
    import json

    while current <= end_date:
        log_file = os.path.join(log_dir, f"audit_{current}.log")
        if os.path.exists(log_file):
            try:
                with open(log_file, "r") as f:
                    for line in f:
                        try:
                            entry = json.loads(line.strip())
                            # Apply filters
                            if user_id and entry.get("user", {}).get("id") != user_id:
                                continue
                            if action and not entry.get("action", "").startswith(action):
                                continue
                            if resource_type and entry.get("resource", {}).get("type") != resource_type:
                                continue

                            logs.append(entry)

                            if len(logs) >= limit:
                                break
                        except json.JSONDecodeError:
                            continue
            except Exception:
                pass

        # Move to next day
        try:
            current_dt = datetime.strptime(current, "%Y%m%d") + timedelta(days=1)
            current = current_dt.strftime("%Y%m%d")
        except ValueError:
            break

        if len(logs) >= limit:
            break

    return {
        "logs": logs[:limit],
        "count": len(logs[:limit]),
        "filtered": {
            "start_date": start_date,
            "end_date": end_date,
            "user_id": user_id,
            "action": action,
            "resource_type": resource_type
        }
    }


@router.get("/stats")
async def get_audit_stats(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get audit statistics for dashboard.

    Provides overview of document operations and security events.
    """
    # RBAC: Only Admin and PM can view stats
    if current_user.role not in ["Admin", "Project Manager"]:
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions"
        )

    from datetime import timedelta
    import json

    stats = {
        "document_actions": {
            "view": 0,
            "download": 0,
            "upload": 0,
            "update": 0,
            "delete": 0,
            "promote": 0,
        },
        "security_events": {
            "login_success": 0,
            "login_failed": 0,
            "permission_denied": 0,
        },
        "status_breakdown": {},
        "daily_activity": {}
    }

    # Read last 7 days of logs
    for i in range(7):
        date = (datetime.utcnow() - timedelta(days=i)).strftime("%Y%m%d")
        log_file = os.path.join(AUDIT_LOG_DIR, f"audit_{date}.log")

        if not os.path.exists(log_file):
            continue

        try:
            with open(log_file, "r") as f:
                for line in f:
                    try:
                        entry = json.loads(line.strip())
                        action = entry.get("action", "")

                        # Count document actions
                        if action.startswith("document."):
                            action_parts = action.split(".")
                            if len(action_parts) > 1:
                                doc_action = action_parts[1]
                                if doc_action in stats["document_actions"]:
                                    stats["document_actions"][doc_action] += 1

                        # Count security events
                        elif action.startswith("auth."):
                            if action == "auth.login.success":
                                stats["security_events"]["login_success"] += 1
                            elif action == "auth.login.failed":
                                stats["security_events"]["login_failed"] += 1

                        # Count permission denials
                        if "denied" in action or "failed" in action:
                            stats["security_events"]["permission_denied"] += 1

                        # Daily activity
                        if date not in stats["daily_activity"]:
                            stats["daily_activity"][date] = 0
                        stats["daily_activity"][date] += 1

                    except json.JSONDecodeError:
                        continue
        except Exception:
            pass

    return stats
