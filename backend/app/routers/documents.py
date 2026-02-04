from typing import List, Optional
from datetime import datetime, timezone
import uuid
import os

from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.document import Document, DocumentVersion
from app.models.user import User
from app.routers.auth import get_current_active_user
from app.schemas.document import (
    DocumentResponse,
    DocumentCreate,
    DocumentUpdate,
    DocumentVersionResponse,
    WorkflowTransition,
    WorkflowTransitionResponse
)
from app.core.rbac import (
    UserRole,
    DocumentStatus,
    Permission,
    can_view_document,
    can_download_document,
    can_update_document,
    can_delete_document,
    can_promote_document
)
from app.core.middleware import audit_log, AuditLogger

router = APIRouter(prefix="/documents", tags=["Documents"])

# File upload directory
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("", response_model=List[DocumentResponse])
async def get_documents(
    status: Optional[str] = Query(None),
    folder: Optional[str] = Query(None),
    discipline: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all documents with optional filtering and RBAC applied.

    ISO 19650 Compliance:
    - WIP (S0) documents are filtered based on user role and ownership
    - All document accesses are logged for audit trail
    """
    with AuditLogger(
        action="document.list",
        user=current_user,
        resource_type="document",
        details={"filters": {"status": status, "discipline": discipline, "search": search}}
    ):
        user_role = UserRole(current_user.role)
        query = db.query(Document)

        # RBAC: Filter documents based on user role
        # Non-Admin users can only see non-WIP documents or their own WIP documents
        if user_role != UserRole.ADMIN:
            from sqlalchemy import or_
            query = query.filter(
                or_(
                    Document.status != DocumentStatus.WIP.value,
                    Document.author_id == current_user.id
                )
            )

        # Apply filters
        if status:
            query = query.filter(Document.status == status)
        if discipline:
            query = query.filter(Document.discipline == discipline)
        if search:
            query = query.filter(Document.name.ilike(f"%{search}%"))

        documents = query.order_by(Document.created_at.desc()).all()

        # Map to response format
        result = []
        for doc in documents:
            versions = db.query(DocumentVersion).filter(
                DocumentVersion.document_id == doc.id
            ).order_by(DocumentVersion.date.desc()).all()

            result.append(DocumentResponse(
                id=doc.id,
                name=doc.name,
                rev=doc.revision,
                status=doc.status,
                size=doc.size or "0 MB",
                date=doc.created_at.strftime("%Y-%m-%d"),
                discipline=doc.discipline,
                author=doc.author_id or "Unknown",
                description=doc.description,
                versions=[
                    DocumentVersionResponse(
                        rev=v.revision,
                        date=v.date.strftime("%Y-%m-%d"),
                        author=v.author_id or "Unknown",
                        comment=v.comment,
                        status=v.status
                    ) for v in versions
                ]
            ))

        return result


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a single document by ID with RBAC check and audit logging."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        audit_log(
            action="document.view.not_found",
            user_id=current_user.id,
            user_email=current_user.email,
            user_role=current_user.role,
            resource_type="document",
            resource_id=document_id,
            success=False,
            status_code=404
        )
        raise HTTPException(status_code=404, detail="Document not found")

    # RBAC: Check if user can view this document
    user_role = UserRole(current_user.role)
    if not can_view_document(
        user_id=current_user.id,
        user_role=user_role,
        document_status=DocumentStatus(doc.status),
        document_author_id=doc.author_id or ""
    ):
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view this document. "
                   "WIP (S0) documents are only visible to their author and Admin users."
        )

    # Audit log successful document view
    audit_log(
        action="document.view",
        user_id=current_user.id,
        user_email=current_user.email,
        user_role=current_user.role,
        resource_type="document",
        resource_id=document_id,
        details={"document_name": doc.name, "document_status": doc.status}
    )

    versions = db.query(DocumentVersion).filter(
        DocumentVersion.document_id == doc.id
    ).order_by(DocumentVersion.date.desc()).all()

    return DocumentResponse(
        id=doc.id,
        name=doc.name,
        rev=doc.revision,
        status=doc.status,
        size=doc.size or "0 MB",
        date=doc.created_at.strftime("%Y-%m-%d"),
        discipline=doc.discipline,
        author=doc.author_id or "Unknown",
        description=doc.description,
        versions=[
            DocumentVersionResponse(
                rev=v.revision,
                date=v.date.strftime("%Y-%m-%d"),
                author=v.author_id or "Unknown",
                comment=v.comment,
                status=v.status
            ) for v in versions
        ]
    )


@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    name: str = Form(...),
    discipline: str = Form(...),
    description: Optional[str] = Form(None),
    container_type: Optional[str] = Form("M3"),
    originator: Optional[str] = Form(None),
    project_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload a new document with ISO 19650 metadata.

    ISO 19650 Compliance:
    - Documents start as WIP (S0) status
    - Uses P-series revision numbering (P01, P02...)
    - Records container type, originator, and classification
    - Full audit trail of document creation
    """
    # RBAC: Check upload permission
    user_role = UserRole(current_user.role)
    from app.core.rbac import ROLE_PERMISSIONS
    if Permission.UPLOAD not in ROLE_PERMISSIONS.get(user_role, set()):
        audit_log(
            action="document.upload.denied",
            user_id=current_user.id,
            user_email=current_user.email,
            user_role=current_user.role,
            resource_type="document",
            details={"document_name": name},
            success=False,
            status_code=403
        )
        raise HTTPException(
            status_code=403,
            detail="Your role does not have permission to upload documents."
        )

    doc_id = str(uuid.uuid4())

    # Save file to disk
    file_extension = os.path.splitext(file.filename or "")[1]
    file_path = os.path.join(UPLOAD_DIR, f"{doc_id}{file_extension}")

    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        file_size_mb = round(len(content) / (1024 * 1024), 2)
        size_str = f"{file_size_mb} MB"

    except Exception as e:
        audit_log(
            action="document.upload.failed",
            user_id=current_user.id,
            user_email=current_user.email,
            user_role=current_user.role,
            resource_type="document",
            details={"error": str(e), "document_name": name},
            success=False,
            status_code=500
        )
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Validate project_id if provided
    if project_id:
        from app.models.project import Project
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            audit_log(
                action="document.upload.invalid_project",
                user_id=current_user.id,
                user_email=current_user.email,
                user_role=current_user.role,
                resource_type="document",
                details={"project_id": project_id, "document_name": name},
                success=False,
                status_code=400
            )
            raise HTTPException(status_code=400, detail=f"Project with ID {project_id} not found")

    # Create document record with ISO 19650 metadata
    try:
        new_doc = Document(
            id=doc_id,
            project_id=project_id,
            name=name,
            revision="P01",
            status="S0",  # Work in Progress
            discipline=discipline,
            description=description,
            container_type=container_type,
            originator=originator,
            size=size_str,
            file_path=file_path,
            author_id=current_user.id
        )

        db.add(new_doc)
        db.flush()  # Flush to get the ID without committing yet

        # Create initial version
        version = DocumentVersion(
            id=str(uuid.uuid4()),
            document_id=new_doc.id,
            revision="P01",
            author_id=current_user.id,
            comment="Initial upload",
            status="S0"
        )
        db.add(version)

        # Commit both document and version
        db.commit()
        db.refresh(new_doc)

    except Exception as e:
        db.rollback()
        # Clean up uploaded file if database operation failed
        if os.path.exists(file_path):
            os.remove(file_path)

        audit_log(
            action="document.upload.db_failed",
            user_id=current_user.id,
            user_email=current_user.email,
            user_role=current_user.role,
            resource_type="document",
            details={"error": str(e), "document_name": name},
            success=False,
            status_code=500
        )
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save document to database: {str(e)}"
        )

    # Audit log successful upload
    audit_log(
        action="document.upload",
        user_id=current_user.id,
        user_email=current_user.email,
        user_role=current_user.role,
        resource_type="document",
        resource_id=doc_id,
        details={
            "document_name": name,
            "file_size": size_str,
            "discipline": discipline,
            "container_type": container_type,
            "originator": originator,
            "project_id": project_id
        }
    )

    return DocumentResponse(
        id=new_doc.id,
        name=new_doc.name,
        rev=new_doc.revision,
        status=new_doc.status,
        size=size_str,
        date=new_doc.created_at.strftime("%Y-%m-%d"),
        discipline=new_doc.discipline,
        author=current_user.name,
        description=new_doc.description,
        versions=[
            DocumentVersionResponse(
                rev="P01",
                date=new_doc.created_at.strftime("%Y-%m-%d"),
                author=current_user.name,
                comment="Initial upload",
                status="S0"
            )
        ]
    )


@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: str,
    data: DocumentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update document metadata with RBAC check."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # RBAC: Check if user can update this document
    user_role = UserRole(current_user.role)
    if not can_update_document(
        user_id=current_user.id,
        user_role=user_role,
        document_status=DocumentStatus(doc.status),
        document_author_id=doc.author_id or ""
    ):
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to update this document. "
                   "Only the document author can update WIP documents."
        )

    # Update fields
    if data.name is not None:
        doc.name = data.name
    if data.description is not None:
        doc.description = data.description
    if data.discipline is not None:
        doc.discipline = data.discipline

    db.commit()
    db.refresh(doc)

    versions = db.query(DocumentVersion).filter(
        DocumentVersion.document_id == doc.id
    ).all()

    return DocumentResponse(
        id=doc.id,
        name=doc.name,
        rev=doc.revision,
        status=doc.status,
        size=doc.size or "0 MB",
        date=doc.updated_at.strftime("%Y-%m-%d"),
        discipline=doc.discipline,
        author=current_user.name,
        description=doc.description,
        versions=[
            DocumentVersionResponse(
                rev=v.revision,
                date=v.date.strftime("%Y-%m-%d"),
                author=v.author_id or "Unknown",
                comment=v.comment,
                status=v.status
            ) for v in versions
        ]
    )


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a document with RBAC check and audit logging.

    ISO 19650 Compliance:
    - Only Admin can delete documents
    - Full audit trail maintained
    - Deletion prevents document recovery (soft delete recommended for production)
    """
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        audit_log(
            action="document.delete.not_found",
            user_id=current_user.id,
            user_email=current_user.email,
            user_role=current_user.role,
            resource_type="document",
            resource_id=document_id,
            success=False,
            status_code=404
        )
        raise HTTPException(status_code=404, detail="Document not found")

    # RBAC: Check if user can delete this document
    user_role = UserRole(current_user.role)
    if not can_delete_document(
        user_id=current_user.id,
        user_role=user_role,
        document_status=DocumentStatus(doc.status),
        document_author_id=doc.author_id or ""
    ):
        audit_log(
            action="document.delete.denied",
            user_id=current_user.id,
            user_email=current_user.email,
            user_role=current_user.role,
            resource_type="document",
            resource_id=document_id,
            details={"document_name": doc.name, "document_status": doc.status},
            success=False,
            status_code=403
        )
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to delete this document. "
                   "Only Admin users can delete documents."
        )

    # Store document info for audit before deletion
    doc_name = doc.name
    doc_status = doc.status

    db.delete(doc)
    db.commit()

    # Audit log successful deletion
    audit_log(
        action="document.delete",
        user_id=current_user.id,
        user_email=current_user.email,
        user_role=current_user.role,
        resource_type="document",
        resource_id=document_id,
        details={"document_name": doc_name, "document_status": doc_status}
    )

    return {"message": "Document deleted successfully"}


@router.post("/{document_id}/workflow", response_model=WorkflowTransitionResponse)
async def promote_document(
    document_id: str,
    workflow: WorkflowTransition,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Promote document through ISO 19650 workflow with state transitions and versioning.

    State Transitions:
    - S0 (Work in Progress) -> S1, S2, S3 (Shared states)
    - S1 (Tender) -> S2, S3, S4
    - S2 (Construction) -> S3, S4
    - S3 (Info Approval) -> S4 (Published)
    - S4 (Published) -> S5 (Archived)

    Versioning:
    - P-series (P01, P02...) for work-in-progress documents
    - C-series (C01, C02...) for published/construction documents
    - Transition from P to C when publishing (S1/S2/S3 -> S4)
    """
    import re

    # Validate document exists
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        audit_log(
            action="document.promote.not_found",
            user_id=current_user.id,
            user_email=current_user.email,
            user_role=current_user.role,
            resource_type="document",
            resource_id=document_id,
            success=False,
            status_code=404
        )
        raise HTTPException(
            status_code=404,
            detail=f"Document with ID {document_id} not found"
        )

    current_status = doc.status
    target_status = workflow.state.upper().strip()
    comment = workflow.comment
    increment_revision = workflow.increment_revision

    # RBAC: Check if user can promote this document
    user_role = UserRole(current_user.role)
    if not can_promote_document(
        user_id=current_user.id,
        user_role=user_role,
        document_status=DocumentStatus(doc.status),
        document_author_id=doc.author_id or "",
        target_status=DocumentStatus(target_status)
    ):
        audit_log(
            action="document.promote.denied",
            user_id=current_user.id,
            user_email=current_user.email,
            user_role=current_user.role,
            resource_type="document",
            resource_id=document_id,
            details={
                "document_name": doc.name,
                "current_status": current_status,
                "target_status": target_status
            },
            success=False,
            status_code=403
        )
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to promote this document. "
                   "Only the document author can promote WIP documents."
        )
    
    # Validate target status
    valid_statuses = ['S0', 'S1', 'S2', 'S3', 'S4', 'S5']
    if target_status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid target status '{target_status}'. Valid statuses: {', '.join(valid_statuses)}"
        )
    
    # Define valid ISO 19650 workflow transitions
    valid_transitions = {
        'S0': ['S1', 'S2', 'S3'],  # Work in Progress -> Shared states
        'S1': ['S2', 'S3', 'S4'],  # Tender -> Construction/Info Approval/Published
        'S2': ['S3', 'S4'],         # Construction -> Info Approval/Published
        'S3': ['S4'],               # Info Approval -> Published
        'S4': ['S5'],               # Published -> Archived
        'S5': []                    # Archived - no transitions allowed
    }
    
    # Validate transition is allowed
    if current_status not in valid_transitions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid current status '{current_status}'. Cannot perform transition."
        )
    
    if target_status not in valid_transitions[current_status]:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid transition from {current_status} to {target_status}. "
                   f"Valid transitions from {current_status}: {', '.join(valid_transitions[current_status])}"
        )
    
    # Prevent transitioning to same state
    if current_status == target_status:
        raise HTTPException(
            status_code=400,
            detail=f"Document is already in state {current_status}. Cannot transition to same state."
        )
    
    # Determine action type based on transition
    action_type = None
    if current_status == 'S0' and target_status in ['S1', 'S2', 'S3']:
        action_type = "share"
    elif current_status in ['S1', 'S2', 'S3'] and target_status == 'S4':
        action_type = "publish"
    elif current_status == 'S4' and target_status == 'S5':
        action_type = "archive"
    elif current_status in ['S1', 'S2', 'S3'] and target_status in ['S2', 'S3']:
        action_type = "coordinate"
    
    # Calculate new revision
    new_rev = doc.revision
    
    # Versioning logic: P-series (P01, P02...) -> C-series (C01, C02...)
    # When publishing (transitioning to S4), change P prefix to C
    if action_type == "publish":
        match = re.match(r'^([A-Za-z]+)(\d+)$', doc.revision)
        if match:
            prefix, num = match.groups()
            num_int = int(num)
            
            # Change prefix from P to C when publishing
            if prefix.upper() == 'P':
                new_rev = f"C{num_int:02d}"
            elif prefix.upper() == 'A':
                # For A-series (Approved), change to C when publishing
                new_rev = f"C{num_int:02d}"
            else:
                # For other prefixes, just increment the number
                new_rev = f"{prefix.upper()}{num_int + 1:02d}"
        else:
            # Fallback: create C01 if revision format is invalid
            new_rev = "C01"
    
    # Increment revision if explicitly requested
    elif increment_revision:
        match = re.match(r'^([A-Za-z]+)(\d+)$', doc.revision)
        if match:
            prefix, num = match.groups()
            num_int = int(num)
            new_rev = f"{prefix.upper()}{num_int + 1:02d}"
        else:
            new_rev = "P01"
    
    # Update document
    doc.revision = new_rev
    doc.status = target_status
    doc.updated_at = datetime.now(timezone.utc)
    
    # Generate auto-comment if not provided
    status_descriptions = {
        'S0': 'Work in Progress',
        'S1': 'Tender/Shared',
        'S2': 'Construction',
        'S3': 'Information Approval',
        'S4': 'Published',
        'S5': 'Archived'
    }
    
    if not comment:
        if action_type == "share":
            comment = f"Shared for coordination - {status_descriptions.get(target_status, target_status)}"
        elif action_type == "publish":
            comment = f"Published for construction - {status_descriptions.get(target_status, target_status)} (Rev {new_rev})"
        elif action_type == "archive":
            comment = f"Archived - {status_descriptions.get(target_status, target_status)}"
        elif action_type == "coordinate":
            comment = f"Coordinated - {status_descriptions.get(target_status, target_status)}"
        else:
            comment = f"Status changed from {current_status} to {target_status}"
    
    # Create version entry with file path
    version = DocumentVersion(
        id=str(uuid.uuid4()),
        document_id=doc.id,
        revision=new_rev,
        author_id=current_user.id,
        comment=comment,
        status=target_status,
        file_path=doc.file_path  # Store the file path in version history
    )
    
    try:
        db.add(version)
        db.commit()
        db.refresh(doc)
        db.refresh(version)
    except Exception as e:
        db.rollback()
        audit_log(
            action="document.promote.failed",
            user_id=current_user.id,
            user_email=current_user.email,
            user_role=current_user.role,
            resource_type="document",
            resource_id=document_id,
            details={"error": str(e), "transition": f"{current_status}->{target_status}"},
            success=False,
            status_code=500
        )
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update document: {str(e)}"
        )

    # Audit log successful workflow transition
    audit_log(
        action="document.promote",
        user_id=current_user.id,
        user_email=current_user.email,
        user_role=current_user.role,
        resource_type="document",
        resource_id=document_id,
        details={
            "document_name": doc.name,
            "previous_status": current_status,
            "new_status": target_status,
            "new_revision": new_rev,
            "action_type": action_type,
            "comment": comment
        }
    )

    # Return success response
    return {
        "message": f"Document {action_type or 'transitioned'} to {target_status}",
        "document_id": doc.id,
        "document_name": doc.name,
        "previous_status": current_status,
        "new_status": target_status,
        "new_revision": new_rev,
        "action": action_type,
        "comment": comment,
        "version_id": version.id,
        "transitioned_at": version.date.isoformat()
    }


@router.get("/{document_id}/download")
async def download_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Download a document file with RBAC check and audit logging."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        audit_log(
            action="document.download.not_found",
            user_id=current_user.id,
            user_email=current_user.email,
            user_role=current_user.role,
            resource_type="document",
            resource_id=document_id,
            success=False,
            status_code=404
        )
        raise HTTPException(status_code=404, detail="Document not found")

    # RBAC: Check if user can download this document
    user_role = UserRole(current_user.role)
    if not can_download_document(
        user_id=current_user.id,
        user_role=user_role,
        document_status=DocumentStatus(doc.status),
        document_author_id=doc.author_id or ""
    ):
        audit_log(
            action="document.download.denied",
            user_id=current_user.id,
            user_email=current_user.email,
            user_role=current_user.role,
            resource_type="document",
            resource_id=document_id,
            details={"document_name": doc.name, "document_status": doc.status},
            success=False,
            status_code=403
        )
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to download this document. "
                   "WIP documents are only accessible to their author and Admin users."
        )

    # Audit log download
    audit_log(
        action="document.download",
        user_id=current_user.id,
        user_email=current_user.email,
        user_role=current_user.role,
        resource_type="document",
        resource_id=document_id,
        details={"document_name": doc.name, "file_size": doc.size}
    )

    # Use stored file path, or fallback to guessing extension
    file_path = doc.file_path if doc.file_path else os.path.join(UPLOAD_DIR, f"{doc.id}")

    # If file_path is relative, make it absolute
    if not os.path.isabs(file_path):
        file_path = os.path.join(UPLOAD_DIR, os.path.basename(file_path))

    # Check if file exists
    if not os.path.exists(file_path):
        # Try with common extensions
        for ext in ['.pdf', '.dwg', '.rvt', '.ifc', '.zip', '.jpg', '.jpeg', '.png', '.gif', '.webp']:
            test_path = os.path.join(UPLOAD_DIR, f"{doc.id}{ext}")
            if os.path.exists(test_path):
                file_path = test_path
                break
        else:
            raise HTTPException(status_code=404, detail="File not found on server")

    return FileResponse(
        path=file_path,
        filename=doc.name,
        media_type='application/octet-stream',
        headers={
            'Content-Disposition': f'attachment; filename="{doc.name}"'
        }
    )


@router.get("/{document_id}/thumbnail")
async def get_document_thumbnail(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get document thumbnail for hover preview with RBAC check."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # RBAC: Check if user can view this document (thumbnail is part of viewing)
    user_role = UserRole(current_user.role)
    if not can_view_document(
        user_id=current_user.id,
        user_role=user_role,
        document_status=DocumentStatus(doc.status),
        document_author_id=doc.author_id or ""
    ):
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view this document thumbnail. "
                   "WIP documents are only visible to their author and Admin users."
        )

    # Use stored file path, or fallback to guessing extension
    file_path = doc.file_path if doc.file_path else os.path.join(UPLOAD_DIR, f"{doc.id}")

    # If file_path is relative, make it absolute
    if not os.path.isabs(file_path):
        file_path = os.path.join(UPLOAD_DIR, os.path.basename(file_path))

    # Check if file exists
    if not os.path.exists(file_path):
        # Try with common extensions
        for ext in ['.pdf', '.dwg', '.rvt', '.ifc', '.zip', '.jpg', '.jpeg', '.png', '.gif', '.webp']:
            test_path = os.path.join(UPLOAD_DIR, f"{doc.id}{ext}")
            if os.path.exists(test_path):
                file_path = test_path
                break
        else:
            raise HTTPException(status_code=404, detail="Thumbnail not available")

    # For images, return the file itself as thumbnail
    if file_path.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
        return FileResponse(
            path=file_path,
            media_type='image/jpeg',
            headers={"Cache-Control": "public, max-age=3600"}
        )

    # For other files, thumbnail not available
    raise HTTPException(status_code=404, detail="Thumbnail not available for this file type")
    # - pdf2image for PDFs
    # - Other libraries for CAD files
    if file_path.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
        return FileResponse(
            path=file_path,
            media_type='image/jpeg',
            headers={"Cache-Control": "public, max-age=3600"}
        )

    # For non-image files, return a placeholder
    raise HTTPException(status_code=404, detail="Thumbnail not available")


@router.get("/{document_id}/preview")
async def get_document_preview(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get document preview for viewer modal with RBAC check."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # RBAC: Check if user can view this document (preview is part of viewing)
    user_role = UserRole(current_user.role)
    if not can_view_document(
        user_id=current_user.id,
        user_role=user_role,
        document_status=DocumentStatus(doc.status),
        document_author_id=doc.author_id or ""
    ):
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to preview this document. "
                   "WIP documents are only visible to their author and Admin users."
        )

    # Use stored file path, or fallback to guessing extension
    file_path = doc.file_path if doc.file_path else os.path.join(UPLOAD_DIR, f"{doc.id}")

    # If file_path is relative, make it absolute
    if not os.path.isabs(file_path):
        file_path = os.path.join(UPLOAD_DIR, os.path.basename(file_path))

    # Check if file exists
    if not os.path.exists(file_path):
        # Try with common extensions
        for ext in ['.pdf', '.dwg', '.rvt', '.ifc', '.zip', '.jpg', '.jpeg', '.png', '.gif', '.webp']:
            test_path = os.path.join(UPLOAD_DIR, f"{doc.id}{ext}")
            if os.path.exists(test_path):
                file_path = test_path
                break
        else:
            raise HTTPException(status_code=404, detail="File not found on server")

    # Determine media type based on file extension
    media_type = 'application/octet-stream'
    if file_path.lower().endswith('.pdf'):
        media_type = 'application/pdf'
    elif file_path.lower().endswith(('.jpg', '.jpeg')):
        media_type = 'image/jpeg'
    elif file_path.lower().endswith('.png'):
        media_type = 'image/png'
    elif file_path.lower().endswith('.gif'):
        media_type = 'image/gif'
    elif file_path.lower().endswith('.webp'):
        media_type = 'image/webp'

    return FileResponse(
        path=file_path,
        media_type=media_type,
        headers={"Cache-Control": "public, max-age=3600"}
    )
