from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.db.database import Base


def get_utc_now():
    """Get current UTC datetime as timezone-aware object."""
    return datetime.now(timezone.utc)


class Inspection(Base):
    """Inspection model for QA/QC and safety checks."""

    __tablename__ = "inspections"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=True)
    title = Column(String, nullable=False)
    type = Column(String, nullable=False)  # QA, QC, Safety, Environmental, Commissioning
    status = Column(String, default="Draft")  # Draft, Scheduled, In Progress, Completed, Failed, Verified, Rejected
    location = Column(String)
    location_x = Column(Integer)  # For map positioning (percentage)
    location_y = Column(Integer)  # For map positioning (percentage)
    assigned_to = Column(String, ForeignKey("users.id"), nullable=True)
    date = Column(DateTime)
    iso_suitability = Column(String)
    ref_container_id = Column(String, ForeignKey("documents.id"), nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    # Relationships
    project = relationship("Project", back_populates="inspections")
    assigned_to_user = relationship("User", back_populates="assigned_inspections")
    ref_container = relationship("Document")
    checklist_items = relationship("ChecklistItem", back_populates="inspection", cascade="all, delete-orphan")


class ChecklistItem(Base):
    """Checklist item for inspections."""

    __tablename__ = "checklist_items"

    id = Column(String, primary_key=True, index=True)
    inspection_id = Column(String, ForeignKey("inspections.id"), nullable=True)
    label = Column(String, nullable=False)
    checked = Column(Boolean, default=False)
    status = Column(String)  # Pass, Fail, N/A
    comment = Column(Text)
    order = Column(Integer, default=0)

    # Relationships
    inspection = relationship("Inspection", back_populates="checklist_items")
