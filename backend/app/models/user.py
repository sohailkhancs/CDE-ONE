from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.db.database import Base


def get_utc_now():
    """Get current UTC datetime as timezone-aware object."""
    return datetime.now(timezone.utc)


class User(Base):
    """User model for authentication and team members."""

    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # Admin, Project Manager, Team Lead, Discipline Lead, Viewer
    avatar = Column(String)
    is_active = Column(Boolean, default=True)
    
    # ISO 19650 specific fields
    organization = Column(String)  # Company/Organization
    discipline = Column(String)  # Architecture, Structural, MEP, etc.
    iso_role = Column(String)  # Lead Appointed Party, Appointed Party, Task Team Member
    
    # Contact information
    phone = Column(String)
    job_title = Column(String)
    department = Column(String)
    
    # Audit fields
    created_by = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now)  # Use database trigger for onupdate
    last_login = Column(DateTime)

    # Relationships - using string references to avoid circular imports
    projects = relationship("Project", foreign_keys="Project.owner_id", back_populates="owner")
    assigned_inspections = relationship("Inspection", back_populates="assigned_to_user")
    team_memberships = relationship("TeamMember", foreign_keys="TeamMember.user_id", back_populates="user", cascade="all, delete-orphan")
