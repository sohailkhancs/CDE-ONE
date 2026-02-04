"""
Authentication and Authorization middleware for ISO 19650 compliant CDE.

This module provides:
- JWT authentication dependency
- Role-based access control (RBAC) decorators
- Audit logging for all document operations
- Permission checking helpers
"""
import json
import os
from datetime import datetime
from functools import wraps
from typing import Callable, List, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import decode_token
from app.core.rbac import (
    UserRole,
    DocumentStatus,
    Permission,
    has_permission,
    can_view_document,
    can_download_document,
    can_update_document,
    can_delete_document,
    can_promote_document,
)
from app.db.database import get_db
from app.models.user import User
from app.routers.auth import get_current_active_user

settings = get_settings()

# Audit log directory
AUDIT_LOG_DIR = "audit_logs"
os.makedirs(AUDIT_LOG_DIR, exist_ok=True)

# Security scheme for API
security = HTTPBearer(auto_error=False)


def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Get current user from JWT token if provided, otherwise return None.
    Used for endpoints that have both authenticated and public access.
    """
    if credentials is None:
        return None

    from app.core.security import decode_token

    token = credentials.credentials
    payload = decode_token(token)
    if payload is None or payload.get("type") != "access":
        return None

    user_id = payload.get("sub")
    if user_id is None:
        return None

    user = db.query(User).filter(User.id == user_id).first()
    return user


def audit_log(
    action: str,
    user_id: str,
    user_email: str,
    user_role: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    details: Optional[dict] = None,
    success: bool = True,
    status_code: int = 200
):
    """
    Write audit log entry for ISO 19650 compliance.

    Audit logs must contain:
    - Timestamp (UTC)
    - User identity and role
    - Action performed
    - Resource affected
    - Success/failure status
    - Additional context

    Args:
        action: The action performed (e.g., "document.view", "document.upload")
        user_id: ID of the user performing the action
        user_email: Email of the user
        user_role: Role of the user
        resource_type: Type of resource (e.g., "document", "project")
        resource_id: ID of the resource (optional)
        details: Additional details about the action
        success: Whether the action succeeded
        status_code: HTTP status code of the response
    """
    log_entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "action": action,
        "user": {
            "id": user_id,
            "email": user_email,
            "role": user_role
        },
        "resource": {
            "type": resource_type,
            "id": resource_id
        },
        "details": details or {},
        "outcome": {
            "success": success,
            "status_code": status_code
        }
    }

    # Write to daily audit log file
    log_file = os.path.join(
        AUDIT_LOG_DIR,
        f"audit_{datetime.utcnow().strftime('%Y%m%d')}.log"
    )

    try:
        with open(log_file, "a") as f:
            f.write(json.dumps(log_entry) + "\n")
    except Exception as e:
        # Fail gracefully but log to console
        print(f"Failed to write audit log: {e}")


class AuditLogger:
    """
    Context manager for audit logging actions with automatic success/failure tracking.
    """

    def __init__(
        self,
        action: str,
        user: User,
        resource_type: str,
        resource_id: Optional[str] = None,
        details: Optional[dict] = None
    ):
        self.action = action
        self.user = user
        self.resource_type = resource_type
        self.resource_id = resource_id
        self.details = details
        self.start_time = datetime.utcnow()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        success = exc_type is None
        status_code = 200 if success else (getattr(exc_val, "status_code", 500))

        audit_log(
            action=self.action,
            user_id=self.user.id,
            user_email=self.user.email,
            user_role=self.user.role,
            resource_type=self.resource_type,
            resource_id=self.resource_id,
            details={
                **(self.details or {}),
                "duration_ms": (datetime.utcnow() - self.start_time).total_seconds() * 1000
            },
            success=success,
            status_code=status_code
        )

        return False  # Don't suppress exceptions


def require_permission(permission: Permission):
    """
    Dependency factory that checks if the current user has the required permission.

    Usage:
        @router.get("/some-endpoint")
        async def some_endpoint(
            current_user: User = Depends(require_permission(Permission.VIEW))
        ):
            ...

    Args:
        permission: The permission required to access the endpoint

    Returns:
        Dependency function that raises HTTPException if permission check fails
    """
    def dependency(current_user: User = Depends(get_current_active_user)) -> User:
        user_role = UserRole(current_user.role)

        if not has_permission(user_role, permission):
            audit_log(
                action=f"permission.denied",
                user_id=current_user.id,
                user_email=current_user.email,
                user_role=current_user.role,
                resource_type="permission",
                resource_id=permission.value,
                details={"required_permission": permission.value},
                success=False,
                status_code=403
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{permission.value}' required. Your role: {current_user.role}"
            )

        return current_user

    return dependency


def require_roles(*roles: UserRole):
    """
    Dependency factory that checks if the current user has one of the required roles.

    Usage:
        @router.get("/admin-only")
        async def admin_endpoint(
            current_user: User = Depends(require_roles(UserRole.ADMIN))
        ):
            ...

    Args:
        *roles: Allowed roles for this endpoint

    Returns:
        Dependency function that raises HTTPException if role check fails
    """
    def dependency(current_user: User = Depends(get_current_active_user)) -> User:
        user_role = UserRole(current_user.role)

        if user_role not in roles:
            audit_log(
                action="role.denied",
                user_id=current_user.id,
                user_email=current_user.email,
                user_role=current_user.role,
                resource_type="role",
                details={"allowed_roles": [r.value for r in roles]},
                success=False,
                status_code=403
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"One of roles {[r.value for r in roles]} required. Your role: {current_user.role}"
            )

        return current_user

    return dependency


def require_document_permission(permission: Permission, document_id_param: str = "document_id"):
    """
    Dependency factory that checks if the current user has permission on a specific document.

    This combines role-based permissions with document-level access control based on:
    - User role
    - Document status (ISO 19650 S0-S5)
    - Document ownership (for WIP documents)

    Usage:
        @router.delete("/{document_id}")
        async def delete_document(
            document_id: str,
            db: Session = Depends(get_db),
            current_user: User = Depends(
                require_document_permission(Permission.DELETE, "document_id")
            )
        ):
            ...

    Args:
        permission: The permission required on the document
        document_id_param: Name of the path parameter containing the document ID

    Returns:
        Dependency function that raises HTTPException if permission check fails
    """
    def dependency(
        document_id: str,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_active_user)
    ) -> User:
        from app.models.document import Document

        # Fetch document
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )

        user_role = UserRole(current_user.role)
        doc_status = DocumentStatus(doc.status)

        # Check permission based on the specific action
        permitted = False
        if permission == Permission.VIEW:
            permitted = can_view_document(
                user_id=current_user.id,
                user_role=user_role,
                document_status=doc_status,
                document_author_id=doc.author_id or ""
            )
        elif permission == Permission.DOWNLOAD:
            permitted = can_download_document(
                user_id=current_user.id,
                user_role=user_role,
                document_status=doc_status,
                document_author_id=doc.author_id or ""
            )
        elif permission == Permission.UPDATE:
            permitted = can_update_document(
                user_id=current_user.id,
                user_role=user_role,
                document_status=doc_status,
                document_author_id=doc.author_id or ""
            )
        elif permission == Permission.DELETE:
            permitted = can_delete_document(
                user_id=current_user.id,
                user_role=user_role,
                document_status=doc_status,
                document_author_id=doc.author_id or ""
            )
        elif permission == Permission.PROMOTE:
            permitted = True  # Will be checked separately with target status

        if not permitted:
            audit_log(
                action=f"document.{permission.value}.denied",
                user_id=current_user.id,
                user_email=current_user.email,
                user_role=current_user.role,
                resource_type="document",
                resource_id=document_id,
                details={
                    "permission": permission.value,
                    "document_status": doc.status,
                    "document_author": doc.author_id
                },
                success=False,
                status_code=403
            )

            # Provide specific error message based on status and role
            if doc_status == DocumentStatus.WIP and user_role != UserRole.ADMIN:
                if doc.author_id != current_user.id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="WIP (S0) documents are only visible to their author and Admin users."
                    )
            else:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"You do not have permission to {permission.value} this document."
                )

        return current_user

    return dependency
