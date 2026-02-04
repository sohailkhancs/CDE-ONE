from sqlalchemy import Column, String, DateTime, ForeignKey
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
    status = Column(String, default="Active")  # Planning, Active, Completed, On Hold
    owner_id = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    # Relationships
    owner = relationship("User", back_populates="projects")
    documents = relationship("Document", back_populates="project")
    inspections = relationship("Inspection", back_populates="project")
    planned_tasks = relationship("PlannedTask", back_populates="project")
    field_tasks = relationship("FieldTask", back_populates="project")
