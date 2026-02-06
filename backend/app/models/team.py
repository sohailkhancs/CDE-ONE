"""Database models for team management."""
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, UniqueConstraint, Text, Date, Float
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from app.db.database import Base


def get_utc_now():
    """Get current UTC datetime as timezone-aware object."""
    return datetime.now(timezone.utc)


class TeamMember(Base):
    """Junction table for project-user assignments with roles and permissions."""
    __tablename__ = "team_members"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Role in this specific project
    project_role = Column(String, nullable=False, default="Viewer")
    
    # ISO 19650 Information Container Permissions
    can_view_wip = Column(Boolean, default=False)
    can_view_shared = Column(Boolean, default=True)
    can_view_published = Column(Boolean, default=True)
    can_view_archived = Column(Boolean, default=False)
    
    # Document permissions per project
    can_upload = Column(Boolean, default=False)
    can_edit = Column(Boolean, default=False)
    can_delete = Column(Boolean, default=False)
    can_approve = Column(Boolean, default=False)
    
    # Discipline-specific access (JSON array stored as string)
    disciplines = Column(Text)
    
    # Audit
    assigned_by = Column(String, ForeignKey("users.id"))
    assigned_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now)  # Use database trigger for onupdate
    
    # Relationships
    project = relationship("Project", back_populates="team_members")
    user = relationship("User", foreign_keys=[user_id], back_populates="team_memberships")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('project_id', 'user_id', name='unique_team_assignment'),
    )


class AuditLog(Base):
    """Complete audit trail for ISO 19650 compliance."""
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp = Column(DateTime, default=get_utc_now, nullable=False)
    
    # Action details
    action_type = Column(String(50), nullable=False)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(String)
    resource_name = Column(String)
    
    # User who performed action
    user_id = Column(String, ForeignKey("users.id"))
    user_email = Column(String)
    user_role = Column(String(100))
    
    # Request metadata
    ip_address = Column(String(50))
    user_agent = Column(Text)
    
    # Change details (JSON string)
    changes = Column(Text)
    outcome = Column(String(50))
    error_message = Column(Text)
    
    # ISO 19650 specific
    project_id = Column(String, ForeignKey("projects.id"))
    document_status = Column(String(10))
