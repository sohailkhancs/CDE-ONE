"""Admin router for user and project management."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
import uuid

from app.db.database import get_db
from app.models.user import User
from app.models.project import Project
from app.models.team import TeamMember, AuditLog
from app.models.document import Document
from app.routers.auth import get_current_active_user
from app.core.security import get_password_hash
from app.schemas.admin import (
    UserCreateAdmin, UserUpdateAdmin, UserResponseAdmin, UserStatsResponse,
    ProjectCreateAdmin, ProjectUpdateAdmin, ProjectResponseAdmin, ProjectStatsResponse,
    TeamMemberAssign, TeamMemberUpdate, TeamMemberResponse
)
import json

router = APIRouter(prefix="/admin", tags=["Admin"])


def require_admin(current_user: User = Depends(get_current_active_user)):
    """Dependency to require admin role."""
    if current_user.role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


# ========== USER MANAGEMENT ==========

@router.get("/users", response_model=List[UserResponseAdmin])
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    role: Optional[str] = None,
    organization: Optional[str] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """List all users with filtering and pagination."""
    query = db.query(User)
    
    # Apply filters
    if role:
        query = query.filter(User.role == role)
    if organization:
        query = query.filter(User.organization == organization)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    if search:
        query = query.filter(
            (User.name.ilike(f"%{search}%")) | 
            (User.email.ilike(f"%{search}%"))
        )
    
    users = query.offset(skip).limit(limit).all()
    
    # Add projects count to each user
    result = []
    for user in users:
        user_dict = {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "avatar": user.avatar,
            "is_active": user.is_active,
            "organization": user.organization,
            "discipline": user.discipline,
            "iso_role": user.iso_role,
            "phone": user.phone,
            "job_title": user.job_title,
            "department": user.department,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "last_login": user.last_login,
            "projects_count": len(user.team_memberships) if user.team_memberships else 0
        }
        result.append(UserResponseAdmin(**user_dict))
    
    return result


@router.get("/users/{user_id}", response_model=UserResponseAdmin)
async def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get single user details."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_dict = {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "avatar": user.avatar,
        "is_active": user.is_active,
        "organization": user.organization,
        "discipline": user.discipline,
        "iso_role": user.iso_role,
        "phone": user.phone,
        "job_title": user.job_title,
        "department": user.department,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
        "last_login": user.last_login,
        "projects_count": len(user.team_memberships) if user.team_memberships else 0
    }
    
    return UserResponseAdmin(**user_dict)


@router.post("/users", response_model=UserResponseAdmin, status_code=status.HTTP_201_CREATED)
async def create_user(
    data: UserCreateAdmin,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new user (admin only)."""
    # Check if email already exists
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    new_user = User(
        id=str(uuid.uuid4()),
        email=data.email,
        name=data.name,
        hashed_password=get_password_hash(data.password),
        role=data.role,
        avatar=data.name[0].upper() if data.name else "U",
        organization=data.organization,
        discipline=data.discipline,
        iso_role=data.iso_role,
        phone=data.phone,
        job_title=data.job_title,
        department=data.department,
        created_by=current_user.id,
        is_active=True
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log audit event
    audit_log = AuditLog(
        action_type="create",
        resource_type="user",
        resource_id=new_user.id,
        resource_name=new_user.name,
        user_id=current_user.id,
        user_email=current_user.email,
        user_role=current_user.role,
        changes=json.dumps({"email": data.email, "role": data.role}),
        outcome="success"
    )
    db.add(audit_log)
    db.commit()
    
    return UserResponseAdmin(
        id=new_user.id,
        email=new_user.email,
        name=new_user.name,
        role=new_user.role,
        avatar=new_user.avatar,
        is_active=new_user.is_active,
        organization=new_user.organization,
        discipline=new_user.discipline,
        iso_role=new_user.iso_role,
        phone=new_user.phone,
        job_title=new_user.job_title,
        department=new_user.department,
        created_at=new_user.created_at,
        updated_at=new_user.updated_at,
        projects_count=0
    )


@router.put("/users/{user_id}", response_model=UserResponseAdmin)
async def update_user(
    user_id: str,
    data: UserUpdateAdmin,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update user details (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    changes = {}
    
    # Update fields if provided
    if data.name is not None:
        changes["name"] = {"old": user.name, "new": data.name}
        user.name = data.name
        user.avatar = data.name[0].upper()
    if data.role is not None:
        changes["role"] = {"old": user.role, "new": data.role}
        user.role = data.role
    if data.organization is not None:
        user.organization = data.organization
    if data.discipline is not None:
        user.discipline = data.discipline
    if data.iso_role is not None:
        user.iso_role = data.iso_role
    if data.phone is not None:
        user.phone = data.phone
    if data.job_title is not None:
        user.job_title = data.job_title
    if data.department is not None:
        user.department = data.department
    if data.is_active is not None:
        changes["is_active"] = {"old": user.is_active, "new": data.is_active}
        user.is_active = data.is_active
    
    db.commit()
    db.refresh(user)
    
    # Log audit event
    if changes:
        audit_log = AuditLog(
            action_type="update",
            resource_type="user",
            resource_id=user.id,
            resource_name=user.name,
            user_id=current_user.id,
            user_email=current_user.email,
            user_role=current_user.role,
            changes=json.dumps(changes),
            outcome="success"
        )
        db.add(audit_log)
        db.commit()
    
    return UserResponseAdmin(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        avatar=user.avatar,
        is_active=user.is_active,
        organization=user.organization,
        discipline=user.discipline,
        iso_role=user.iso_role,
        phone=user.phone,
        job_title=user.job_title,
        department=user.department,
        created_at=user.created_at,
        updated_at=user.updated_at,
        last_login=user.last_login,
        projects_count=len(user.team_memberships) if user.team_memberships else 0
    )


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Deactivate user (soft delete)."""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = False
    db.commit()
    
    # Log audit event
    audit_log = AuditLog(
        action_type="delete",
        resource_type="user",
        resource_id=user.id,
        resource_name=user.name,
        user_id=current_user.id,
        user_email=current_user.email,
        user_role=current_user.role,
        outcome="success"
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": "User deactivated successfully"}


@router.get("/users/stats/overview", response_model=UserStatsResponse)
async def get_user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get user statistics for admin dashboard."""
    total_users = db.query(func.count(User.id)).scalar()
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar()
    inactive_users = total_users - active_users
    
    # Users by role
    roles = db.query(User.role, func.count(User.id)).group_by(User.role).all()
    users_by_role = {role: count for role, count in roles}
    
    # Users by discipline
    disciplines = db.query(User.discipline, func.count(User.id)).filter(
        User.discipline.isnot(None)
    ).group_by(User.discipline).all()
    users_by_discipline = {disc: count for disc, count in disciplines}
    
    # Recent logins
    recent_users = db.query(User).filter(
        User.last_login.isnot(None)
    ).order_by(User.last_login.desc()).limit(5).all()
    recent_logins = [
        {"id": u.id, "name": u.name, "last_login": u.last_login}
        for u in recent_users
    ]
    
    return UserStatsResponse(
        total_users=total_users,
        active_users=active_users,
        inactive_users=inactive_users,
        users_by_role=users_by_role,
        users_by_discipline=users_by_discipline,
        recent_logins=recent_logins
    )


# ========== PROJECT MANAGEMENT ==========

@router.get("/projects", response_model=List[ProjectResponseAdmin])
async def list_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """List all projects with filtering."""
    query = db.query(Project)
    
    if status:
        query = query.filter(Project.status == status)
    if search:
        query = query.filter(
            (Project.name.ilike(f"%{search}%")) | 
            (Project.code.ilike(f"%{search}%"))
        )
    
    projects = query.offset(skip).limit(limit).all()
    
    result = []
    for project in projects:
        team_size = len(project.team_members) if project.team_members else 0
        docs_count = len(project.documents) if project.documents else 0
        
        project_dict = {
            "id": project.id,
            "name": project.name,
            "code": project.code,
            "description": project.description,
            "status": project.status,
            "project_number": project.project_number,
            "originator": project.originator,
            "volume_zone": project.volume_zone,
            "classification": project.classification,
            "client_name": project.client_name,
            "location": project.location,
            "start_date": project.start_date,
            "target_completion_date": project.target_completion_date,
            "contract_value": project.contract_value,
            "visibility": project.visibility,
            "owner_id": project.owner_id,
            "created_by": project.created_by,
            "created_at": project.created_at,
            "updated_at": project.updated_at,
            "team_size": team_size,
            "documents_count": docs_count
        }
        result.append(ProjectResponseAdmin(**project_dict))
    
    return result


@router.post("/projects", response_model=ProjectResponseAdmin, status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreateAdmin,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new project (admin only)."""
    # Check if code already exists
    existing = db.query(Project).filter(Project.code == data.code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project code already exists"
        )
    
    new_project = Project(
        id=str(uuid.uuid4()),
        name=data.name,
        code=data.code,
        description=data.description,
        status=data.status,
        project_number=data.project_number,
        originator=data.originator,
        volume_zone=data.volume_zone,
        classification=data.classification,
        client_name=data.client_name,
        location=data.location,
        start_date=data.start_date,
        target_completion_date=data.target_completion_date,
        contract_value=data.contract_value,
        visibility=data.visibility,
        owner_id=data.owner_id,
        created_by=current_user.id
    )
    
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    
    # Log audit event
    audit_log = AuditLog(
        action_type="create",
        resource_type="project",
        resource_id=new_project.id,
        resource_name=new_project.name,
        user_id=current_user.id,
        user_email=current_user.email,
        user_role=current_user.role,
        project_id=new_project.id,
        changes=json.dumps({"code": data.code, "status": data.status}),
        outcome="success"
    )
    db.add(audit_log)
    db.commit()
    
    return ProjectResponseAdmin(
        id=new_project.id,
        name=new_project.name,
        code=new_project.code,
        description=new_project.description,
        status=new_project.status,
        project_number=new_project.project_number,
        originator=new_project.originator,
        volume_zone=new_project.volume_zone,
        classification=new_project.classification,
        client_name=new_project.client_name,
        location=new_project.location,
        start_date=new_project.start_date,
        target_completion_date=new_project.target_completion_date,
        contract_value=new_project.contract_value,
        visibility=new_project.visibility,
        owner_id=new_project.owner_id,
        created_by=new_project.created_by,
        created_at=new_project.created_at,
        updated_at=new_project.updated_at,
        team_size=0,
        documents_count=0
    )


@router.get("/projects/{project_id}", response_model=ProjectResponseAdmin)
async def get_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get project details."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return ProjectResponseAdmin(
        id=project.id,
        name=project.name,
        code=project.code,
        description=project.description,
        status=project.status,
        project_number=project.project_number,
        originator=project.originator,
        volume_zone=project.volume_zone,
        classification=project.classification,
        client_name=project.client_name,
        location=project.location,
        start_date=project.start_date,
        target_completion_date=project.target_completion_date,
        contract_value=project.contract_value,
        visibility=project.visibility,
        owner_id=project.owner_id,
        created_by=project.created_by,
        created_at=project.created_at,
        updated_at=project.updated_at,
        team_size=len(project.team_members) if project.team_members else 0,
        documents_count=len(project.documents) if project.documents else 0
    )


@router.put("/projects/{project_id}", response_model=ProjectResponseAdmin)
async def update_project(
    project_id: str,
    data: ProjectUpdateAdmin,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update project details (admin only)."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Update fields if provided
    update_fields = data.dict(exclude_unset=True)
    for field, value in update_fields.items():
        setattr(project, field, value)
    
    db.commit()
    db.refresh(project)
    
    return ProjectResponseAdmin(
        id=project.id,
        name=project.name,
        code=project.code,
        description=project.description,
        status=project.status,
        project_number=project.project_number,
        originator=project.originator,
        volume_zone=project.volume_zone,
        classification=project.classification,
        client_name=project.client_name,
        location=project.location,
        start_date=project.start_date,
        target_completion_date=project.target_completion_date,
        contract_value=project.contract_value,
        visibility=project.visibility,
        owner_id=project.owner_id,
        created_by=project.created_by,
        created_at=project.created_at,
        updated_at=project.updated_at,
        team_size=len(project.team_members) if project.team_members else 0,
        documents_count=len(project.documents) if project.documents else 0
    )


@router.delete("/projects/{project_id}")
async def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete project (admin only). This will cascade delete all related data."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project_name = project.name
    
    # Log audit before deletion
    audit_log = AuditLog(
        action_type="delete",
        resource_type="project",
        resource_id=project.id,
        resource_name=project_name,
        user_id=current_user.id,
        user_email=current_user.email,
        user_role=current_user.role,
        project_id=project.id,
        outcome="success"
    )
    db.add(audit_log)
    
    db.delete(project)
    db.commit()
    
    return {"message": f"Project '{project_name}' deleted successfully"}


# ========== TEAM ASSIGNMENT ==========

@router.get("/projects/{project_id}/team", response_model=List[TeamMemberResponse])
async def get_project_team(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all team members assigned to a project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    team_members = db.query(TeamMember).filter(TeamMember.project_id == project_id).all()
    
    result = []
    for tm in team_members:
        user = db.query(User).filter(User.id == tm.user_id).first()
        if user:
            disciplines = json.loads(tm.disciplines) if tm.disciplines else []
            result.append(TeamMemberResponse(
                id=tm.id,
                project_id=tm.project_id,
                user_id=tm.user_id,
                user_name=user.name,
                user_email=user.email,
                user_avatar=user.avatar,
                project_role=tm.project_role,
                can_view_wip=tm.can_view_wip,
                can_view_shared=tm.can_view_shared,
                can_view_published=tm.can_view_published,
                can_view_archived=tm.can_view_archived,
                can_upload=tm.can_upload,
                can_edit=tm.can_edit,
                can_delete=tm.can_delete,
                can_approve=tm.can_approve,
                disciplines=disciplines,
                assigned_at=tm.assigned_at
            ))
    
    return result


@router.post("/projects/{project_id}/team", response_model=TeamMemberResponse, status_code=status.HTTP_201_CREATED)
async def assign_user_to_project(
    project_id: str,
    data: TeamMemberAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Assign a user to a project with specific role and permissions."""
    # Check project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check user exists
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already assigned
    existing = db.query(TeamMember).filter(
        TeamMember.project_id == project_id,
        TeamMember.user_id == data.user_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already assigned to this project"
        )
    
    # Create team member assignment
    team_member = TeamMember(
        id=str(uuid.uuid4()),
        project_id=project_id,
        user_id=data.user_id,
        project_role=data.project_role,
        can_view_wip=data.can_view_wip,
        can_view_shared=data.can_view_shared,
        can_view_published=data.can_view_published,
        can_view_archived=data.can_view_archived,
        can_upload=data.can_upload,
        can_edit=data.can_edit,
        can_delete=data.can_delete,
        can_approve=data.can_approve,
        disciplines=json.dumps(data.disciplines) if data.disciplines else None,
        assigned_by=current_user.id
    )
    
    db.add(team_member)
    db.commit()
    db.refresh(team_member)
    
    # Log audit
    audit_log = AuditLog(
        action_type="assign",
        resource_type="team_member",
        resource_id=team_member.id,
        resource_name=f"{user.name} -> {project.name}",
        user_id=current_user.id,
        user_email=current_user.email,
        user_role=current_user.role,
        project_id=project_id,
        changes=json.dumps({"user": user.email, "role": data.project_role}),
        outcome="success"
    )
    db.add(audit_log)
    db.commit()
    
    return TeamMemberResponse(
        id=team_member.id,
        project_id=team_member.project_id,
        user_id=team_member.user_id,
        user_name=user.name,
        user_email=user.email,
        user_avatar=user.avatar,
        project_role=team_member.project_role,
        can_view_wip=team_member.can_view_wip,
        can_view_shared=team_member.can_view_shared,
        can_view_published=team_member.can_view_published,
        can_view_archived=team_member.can_view_archived,
        can_upload=team_member.can_upload,
        can_edit=team_member.can_edit,
        can_delete=team_member.can_delete,
        can_approve=team_member.can_approve,
        disciplines=data.disciplines,
        assigned_at=team_member.assigned_at
    )


@router.delete("/projects/{project_id}/team/{user_id}")
async def remove_user_from_project(
    project_id: str,
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Remove a user from a project."""
    team_member = db.query(TeamMember).filter(
        TeamMember.project_id == project_id,
        TeamMember.user_id == user_id
    ).first()
    
    if not team_member:
        raise HTTPException(status_code=404, detail="Team assignment not found")
    
    db.delete(team_member)
    db.commit()
    
    return {"message": "User removed from project successfully"}
