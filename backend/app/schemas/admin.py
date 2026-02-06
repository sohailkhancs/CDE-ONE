"""Pydantic schemas for admin operations."""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date


class UserCreateAdmin(BaseModel):
    """Schema for admin creating a new user."""
    email: EmailStr
    name: str
    password: str = Field(min_length=6)
    role: str = Field(default="Viewer")
    organization: Optional[str] = None
    discipline: Optional[str] = None
    iso_role: Optional[str] = None
    phone: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None


class UserUpdateAdmin(BaseModel):
    """Schema for admin updating a user."""
    name: Optional[str] = None
    role: Optional[str] = None
    organization: Optional[str] = None
    discipline: Optional[str] = None
    iso_role: Optional[str] = None
    phone: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponseAdmin(BaseModel):
    """Schema for returning user data to admin."""
    id: str
    email: str
    name: str
    role: str
    avatar: Optional[str] = None
    is_active: bool
    organization: Optional[str] = None
    discipline: Optional[str] = None
    iso_role: Optional[str] = None
    phone: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    projects_count: Optional[int] = 0

    class Config:
        from_attributes = True


class ProjectCreateAdmin(BaseModel):
    """Schema for admin creating a new project."""
    name: str = Field(min_length=1)
    code: str = Field(min_length=1)
    description: Optional[str] = None
    status: str = Field(default="Planning")
    project_number: Optional[str] = None
    originator: Optional[str] = None
    volume_zone: Optional[str] = None
    classification: Optional[str] = None
    client_name: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    target_completion_date: Optional[date] = None
    contract_value: Optional[float] = None
    visibility: str = Field(default="Private")
    owner_id: Optional[str] = None


class ProjectUpdateAdmin(BaseModel):
    """Schema for admin updating a project."""
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    project_number: Optional[str] = None
    originator: Optional[str] = None
    volume_zone: Optional[str] = None
    classification: Optional[str] = None
    client_name: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    target_completion_date: Optional[date] = None
    contract_value: Optional[float] = None
    visibility: Optional[str] = None
    owner_id: Optional[str] = None


class ProjectResponseAdmin(BaseModel):
    """Schema for returning project data to admin."""
    id: str
    name: str
    code: str
    description: Optional[str] = None
    status: str
    project_number: Optional[str] = None
    originator: Optional[str] = None
    volume_zone: Optional[str] = None
    classification: Optional[str] = None
    client_name: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    target_completion_date: Optional[date] = None
    contract_value: Optional[float] = None
    visibility: str
    owner_id: Optional[str] = None
    created_by: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    team_size: Optional[int] = 0
    documents_count: Optional[int] = 0

    class Config:
        from_attributes = True


class TeamMemberAssign(BaseModel):
    """Schema for assigning a user to a project."""
    user_id: str
    project_role: str = Field(default="Viewer")
    can_view_wip: bool = Field(default=False)
    can_view_shared: bool = Field(default=True)
    can_view_published: bool = Field(default=True)
    can_view_archived: bool = Field(default=False)
    can_upload: bool = Field(default=False)
    can_edit: bool = Field(default=False)
    can_delete: bool = Field(default=False)
    can_approve: bool = Field(default=False)
    disciplines: Optional[List[str]] = None


class TeamMemberUpdate(BaseModel):
    """Schema for updating team member permissions."""
    project_role: Optional[str] = None
    can_view_wip: Optional[bool] = None
    can_view_shared: Optional[bool] = None
    can_view_published: Optional[bool] = None
    can_view_archived: Optional[bool] = None
    can_upload: Optional[bool] = None
    can_edit: Optional[bool] = None
    can_delete: Optional[bool] = None
    can_approve: Optional[bool] = None
    disciplines: Optional[List[str]] = None


class TeamMemberResponse(BaseModel):
    """Schema for returning team member data."""
    id: str
    project_id: str
    user_id: str
    user_name: str
    user_email: str
    user_avatar: Optional[str] = None
    project_role: str
    can_view_wip: bool
    can_view_shared: bool
    can_view_published: bool
    can_view_archived: bool
    can_upload: bool
    can_edit: bool
    can_delete: bool
    can_approve: bool
    disciplines: Optional[List[str]] = None
    assigned_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserStatsResponse(BaseModel):
    """Statistics for admin dashboard."""
    total_users: int
    active_users: int
    inactive_users: int
    users_by_role: dict
    users_by_discipline: dict
    recent_logins: List[dict]


class ProjectStatsResponse(BaseModel):
    """Project statistics for admin dashboard."""
    total_projects: int
    active_projects: int
    planning_projects: int
    completed_projects: int
    projects_by_status: dict
    total_team_members: int
    total_documents: int
