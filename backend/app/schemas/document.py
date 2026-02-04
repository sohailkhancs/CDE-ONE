from pydantic import BaseModel, EmailStr
from typing import Optional, List


class DocumentVersionResponse(BaseModel):
    """Document version response."""
    rev: str
    date: str
    author: str
    comment: Optional[str] = None
    status: str

    class Config:
        from_attributes = True


class DocumentResponse(BaseModel):
    """Document response matching frontend FileEntry type."""
    id: str
    name: str
    rev: str
    status: str
    size: str
    date: str
    discipline: str
    author: str
    description: Optional[str] = None
    versions: Optional[List[DocumentVersionResponse]] = []

    class Config:
        from_attributes = True


class DocumentCreate(BaseModel):
    """Document creation request."""
    name: str
    discipline: str
    description: Optional[str] = None
    container_type: Optional[str] = "M3"
    originator: Optional[str] = None


class DocumentUpdate(BaseModel):
    """Document update request."""
    name: Optional[str] = None
    description: Optional[str] = None
    discipline: Optional[str] = None


class WorkflowTransition(BaseModel):
    """Workflow transition request."""
    state: str  # Target state: S1, S2, S3, S4, etc.
    comment: Optional[str] = None  # Optional comment for the transition
    increment_revision: Optional[bool] = False  # Whether to increment revision


class WorkflowTransitionResponse(BaseModel):
    """Workflow transition response."""
    message: str
    document_id: str
    document_name: str
    previous_status: str
    new_status: str
    new_revision: str
    action: Optional[str] = None  # 'share', 'publish', 'archive', 'coordinate'
    comment: str
    version_id: str
    transitioned_at: str
