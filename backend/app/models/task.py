from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Float, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.db.database import Base


def get_utc_now():
    """Get current UTC datetime as timezone-aware object."""
    return datetime.now(timezone.utc)


class PlannedTask(Base):
    """Planned task for Gantt chart/schedule."""

    __tablename__ = "planned_tasks"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=True)
    wbs = Column(String)  # Work Breakdown Structure code
    name = Column(String, nullable=False)
    start = Column(DateTime, nullable=False)
    finish = Column(DateTime, nullable=False)
    duration = Column(Integer, nullable=False)  # in days
    progress = Column(Float, default=0)  # 0-100
    resource = Column(String)
    outline_level = Column(Integer)
    is_expanded = Column(Boolean, default=False)
    is_critical = Column(Boolean, default=False)
    linked_field_task_id = Column(String, ForeignKey("field_tasks.id"), nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    # Relationships
    project = relationship("Project", back_populates="planned_tasks")
    linked_field_task = relationship("FieldTask", foreign_keys=[linked_field_task_id])


class FieldTask(Base):
    """Field task for site issues/snags."""

    __tablename__ = "field_tasks"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=True)
    type = Column(String, nullable=False)  # Defect, Safety, RFI, Observation
    status = Column(String, default="Open")  # Open, Pending, Closed, Draft
    title = Column(String, nullable=False)
    location_x = Column(Float)  # Map position (percentage)
    location_y = Column(Float)  # Map position (percentage)
    assignee = Column(String)
    priority = Column(String)  # Low, Medium, High, Critical
    due_date = Column(DateTime)
    discipline = Column(String)
    description = Column(Text)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    # Relationships
    project = relationship("Project", back_populates="field_tasks")
    linked_planned_tasks = relationship("PlannedTask", foreign_keys="PlannedTask.linked_field_task_id", overlaps="linked_field_task_id")
