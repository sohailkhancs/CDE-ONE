"""
Role-Based Access Control (RBAC) module for document visibility.

This module defines permissions and access control rules for ISO 19650 documents.
WIP (S0) documents are restricted based on user roles and document ownership.
"""

from typing import List, Set
from enum import Enum


class UserRole(str, Enum):
    """User roles in the CDE system."""
    ADMIN = "Admin"
    PROJECT_MANAGER = "Project Manager"
    VIEWER = "Viewer"


class DocumentStatus(str, Enum):
    """ISO 19650 document statuses."""
    WIP = "S0"  # Work in Progress
    TENDER = "S1"  # Tender/Shared
    CONSTRUCTION = "S2"  # Construction
    INFO_APPROVAL = "S3"  # Information Approval
    PUBLISHED = "S4"  # Published
    ARCHIVED = "S5"  # Archived


class Permission(str, Enum):
    """Document permissions."""
    VIEW = "view"
    DOWNLOAD = "download"
    UPLOAD = "upload"
    UPDATE = "update"
    DELETE = "delete"
    PROMOTE = "promote"
    SHARE = "share"


# Role-based permission matrix
ROLE_PERMISSIONS: dict[UserRole, Set[Permission]] = {
    UserRole.ADMIN: {
        Permission.VIEW,
        Permission.DOWNLOAD,
        Permission.UPLOAD,
        Permission.UPDATE,
        Permission.DELETE,
        Permission.PROMOTE,
        Permission.SHARE,
    },
    UserRole.PROJECT_MANAGER: {
        Permission.VIEW,
        Permission.DOWNLOAD,
        Permission.UPLOAD,
        Permission.UPDATE,
        Permission.PROMOTE,
        Permission.SHARE,
    },
    UserRole.VIEWER: {
        Permission.VIEW,
        Permission.DOWNLOAD,
    },
}


def has_permission(user_role: UserRole, permission: Permission) -> bool:
    """
    Check if a user role has a specific permission.
    
    Args:
        user_role: The user's role
        permission: The permission to check
        
    Returns:
        True if the user has the permission, False otherwise
    """
    return permission in ROLE_PERMISSIONS.get(user_role, set())


def can_view_document(
    user_id: str,
    user_role: UserRole,
    document_status: DocumentStatus,
    document_author_id: str
) -> bool:
    """
    Check if a user can view a document based on RBAC rules.
    
    RBAC Rules:
    - Admin users can view all documents regardless of status
    - Non-Admin users can view:
      - All non-WIP (S1-S5) documents
      - Their own WIP (S0) documents only
    
    Args:
        user_id: The ID of the user attempting to view
        user_role: The role of the user
        document_status: The status of the document
        document_author_id: The ID of the document's author
        
    Returns:
        True if the user can view the document, False otherwise
    """
    # Admin users can view all documents
    if user_role == UserRole.ADMIN:
        return True
    
    # Non-Admin users can view non-WIP documents
    if document_status != DocumentStatus.WIP:
        return True
    
    # Non-Admin users can only view their own WIP documents
    return document_author_id == user_id


def can_download_document(
    user_id: str,
    user_role: UserRole,
    document_status: DocumentStatus,
    document_author_id: str
) -> bool:
    """
    Check if a user can download a document.
    
    Args:
        user_id: The ID of the user attempting to download
        user_role: The role of the user
        document_status: The status of the document
        document_author_id: The ID of the document's author
        
    Returns:
        True if the user can download the document, False otherwise
    """
    # Check if user has download permission
    if not has_permission(user_role, Permission.DOWNLOAD):
        return False
    
    # Apply same visibility rules as viewing
    return can_view_document(user_id, user_role, document_status, document_author_id)


def can_update_document(
    user_id: str,
    user_role: UserRole,
    document_status: DocumentStatus,
    document_author_id: str
) -> bool:
    """
    Check if a user can update a document.
    
    Args:
        user_id: The ID of the user attempting to update
        user_role: The role of the user
        document_status: The status of the document
        document_author_id: The ID of the document's author
        
    Returns:
        True if the user can update the document, False otherwise
    """
    # Check if user has update permission
    if not has_permission(user_role, Permission.UPDATE):
        return False
    
    # Admin can update any document
    if user_role == UserRole.ADMIN:
        return True
    
    # Only document author can update WIP documents (for non-Admin users)
    if document_status == DocumentStatus.WIP:
        return document_author_id == user_id
    
    # Project Manager can update non-WIP documents
    if user_role == UserRole.PROJECT_MANAGER:
        return True
    
    return False


def can_delete_document(
    user_id: str,
    user_role: UserRole,
    document_status: DocumentStatus,
    document_author_id: str
) -> bool:
    """
    Check if a user can delete a document.
    
    Args:
        user_id: The ID of the user attempting to delete
        user_role: The role of the user
        document_status: The status of the document
        document_author_id: The ID of the document's author
        
    Returns:
        True if the user can delete the document, False otherwise
    """
    # Check if user has delete permission
    if not has_permission(user_role, Permission.DELETE):
        return False
    
    # Only Admin can delete documents
    return user_role == UserRole.ADMIN


def can_promote_document(
    user_id: str,
    user_role: UserRole,
    document_status: DocumentStatus,
    document_author_id: str,
    target_status: DocumentStatus
) -> bool:
    """
    Check if a user can promote a document to a new status.
    
    Args:
        user_id: The ID of the user attempting to promote
        user_role: The role of the user
        document_status: The current status of the document
        document_author_id: The ID of the document's author
        target_status: The target status to promote to
        
    Returns:
        True if the user can promote the document, False otherwise
    """
    # Check if user has promote permission
    if not has_permission(user_role, Permission.PROMOTE):
        return False
    
    # Admin can promote any document
    if user_role == UserRole.ADMIN:
        return True
    
    # Only document author can promote WIP documents (for non-Admin users)
    if document_status == DocumentStatus.WIP:
        return document_author_id == user_id
    
    # Project Manager can promote non-WIP documents
    if user_role == UserRole.PROJECT_MANAGER:
        return True
    
    return False


def get_visible_statuses(user_role: UserRole) -> List[DocumentStatus]:
    """
    Get the list of document statuses visible to a user role.
    
    Args:
        user_role: The user's role
        
    Returns:
        List of visible document statuses
    """
    if user_role == UserRole.ADMIN:
        return [
            DocumentStatus.WIP,
            DocumentStatus.TENDER,
            DocumentStatus.CONSTRUCTION,
            DocumentStatus.INFO_APPROVAL,
            DocumentStatus.PUBLISHED,
            DocumentStatus.ARCHIVED,
        ]
    
    # Non-Admin users can see all statuses except WIP
    return [
        DocumentStatus.TENDER,
        DocumentStatus.CONSTRUCTION,
        DocumentStatus.INFO_APPROVAL,
        DocumentStatus.PUBLISHED,
        DocumentStatus.ARCHIVED,
    ]
