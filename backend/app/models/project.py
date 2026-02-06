from sqlalchemy import Column, String, DateTime, ForeignKey, Date, Float
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.db.database import Base


def get_utc_now():
    """Get current UTC datetime as timezone-aware object."""
    return datetime.now(timezone.utc)


class Project(Base):
    """Project model for construction projects."""

    __tablename__ = "projects"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, nullable=False)  # e.g., ST-P2
    description = Column(String)
    status = Column(String, default="Planning")  # Planning, Active, Completed, On Hold, Archived
    owner_id = Column(String, ForeignKey("users.id"), nullable=True)
    
    # ISO 19650 Fields
    project_number = Column(String, unique=True)  # ISO 19650 Project Number
    originator = Column(String)  # Lead organization code
    volume_zone = Column(String)  # Building/zone identifier
    classification = Column(String)  # Uniclass classification
    
    # Project metadata
    client_name = Column(String)
    location = Column(String)
    start_date = Column(Date)
    target_completion_date = Column(Date)
    contract_value = Column(Float)
    
    # Permissions
    visibility = Column(String, default="Private")  # Private, Internal, Public
    
    # Audit
    created_by = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now)  # Use database trigger for onupdate

    # Relationships
    owner = relationship("User", foreign_keys=[owner_id], back_populates="projects")
    documents = relationship("Document", back_populates="project")
    inspections = relationship("Inspection", back_populates="project")
    planned_tasks = relationship("PlannedTask", back_populates="project")
    field_tasks = relationship("FieldTask", back_populates="project")
    team_members = relationship("TeamMember", back_populates="project", cascade="all, delete-orphan")
