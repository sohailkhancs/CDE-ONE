from pydantic import BaseModel, EmailStr
from typing import Optional


class TeamMemberResponse(BaseModel):
    """Team member response matching frontend User type."""
    id: str
    name: str
    email: str
    role: str  # Admin, Project Manager, Viewer
    avatar: Optional[str] = None

    class Config:
        from_attributes = True


class TeamMemberCreate(BaseModel):
    """Team member creation/invite request."""
    email: EmailStr
    name: str
    role: str = "Viewer"
    projectId: Optional[str] = None


class TeamMemberUpdate(BaseModel):
    """Team member update request."""
    name: Optional[str] = None
    role: Optional[str] = None
