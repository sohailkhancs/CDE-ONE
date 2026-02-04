from sqlalchemy import Column, String, Boolean, DateTime
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
    role = Column(String, nullable=False)  # Admin, Project Manager, Viewer
    avatar = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    # Relationships
    projects = relationship("Project", back_populates="owner")
    assigned_inspections = relationship("Inspection", back_populates="assigned_to_user")
