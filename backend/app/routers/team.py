from typing import List
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.routers.auth import get_current_active_user
from app.schemas.team import TeamMemberResponse, TeamMemberCreate, TeamMemberUpdate

router = APIRouter(prefix="/team", tags=["Team"])


@router.get("", response_model=List[TeamMemberResponse])
async def get_team_members(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all team members."""
    users = db.query(User).filter(User.is_active == True).all()

    return [
        TeamMemberResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            avatar=user.avatar
        )
        for user in users
    ]


@router.get("/{member_id}", response_model=TeamMemberResponse)
async def get_team_member(
    member_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a single team member by ID."""
    user = db.query(User).filter(User.id == member_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Team member not found")

    return TeamMemberResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        avatar=user.avatar
    )


@router.post("/invite", response_model=TeamMemberResponse, status_code=status.HTTP_201_CREATED)
async def invite_team_member(
    data: TeamMemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Invite a new team member (creates user with default password)."""
    from app.core.security import get_password_hash

    # Check if user already exists
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )

    # Create new user with default password
    default_password = "changeme123"  # User should change on first login
    new_user = User(
        id=str(uuid.uuid4()),
        email=data.email,
        name=data.name,
        hashed_password=get_password_hash(default_password),
        role=data.role,
        avatar=data.name[0].upper()
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return TeamMemberResponse(
        id=new_user.id,
        email=new_user.email,
        name=new_user.name,
        role=new_user.role,
        avatar=new_user.avatar
    )


@router.put("/{member_id}", response_model=TeamMemberResponse)
async def update_team_member(
    member_id: str,
    data: TeamMemberUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update team member details."""
    user = db.query(User).filter(User.id == member_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Team member not found")

    if data.name:
        user.name = data.name
        user.avatar = data.name[0].upper()
    if data.role:
        user.role = data.role

    db.commit()
    db.refresh(user)

    return TeamMemberResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        avatar=user.avatar
    )


@router.delete("/{member_id}")
async def remove_team_member(
    member_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Remove/deactivate a team member."""
    user = db.query(User).filter(User.id == member_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Team member not found")

    # Soft delete (deactivate)
    user.is_active = False
    db.commit()

    return {"message": "Team member removed successfully"}


@router.put("/{member_id}/role", response_model=TeamMemberResponse)
async def update_member_role(
    member_id: str,
    role: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update team member role."""
    user = db.query(User).filter(User.id == member_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Team member not found")

    user.role = role
    db.commit()
    db.refresh(user)

    return TeamMemberResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        avatar=user.avatar
    )
