from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.db.database import Base


def get_utc_now():
    """Get current UTC datetime as timezone-aware object."""
    return datetime.now(timezone.utc)


class Document(Base):
    """Document model for ISO 19650 information containers."""

    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=True)
    name = Column(String, nullable=False)
    revision = Column(String, nullable=False)  # e.g., P01, C03
    status = Column(String, nullable=False)  # S0, S1, S2, S3, S4, A1
    suitability = Column(String)  # ISO suitability level
    size = Column(String)  # File size in MB
    file_path = Column(String)  # Storage path
    discipline = Column(String)  # Architecture, Structural, MEP, etc.
    author_id = Column(String, ForeignKey("users.id"), nullable=True)
    description = Column(Text)
    originator = Column(String)  # Company code
    container_type = Column(String)  # M3 - 3D Model, D1 - Drawing, etc.
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    # Relationships
    project = relationship("Project", back_populates="documents")
    versions = relationship("DocumentVersion", back_populates="document", cascade="all, delete-orphan")


class DocumentVersion(Base):
    """Document version history."""

    __tablename__ = "document_versions"

    id = Column(String, primary_key=True, index=True)
    document_id = Column(String, ForeignKey("documents.id"), nullable=True)
    revision = Column(String, nullable=False)
    date = Column(DateTime, default=get_utc_now)
    author_id = Column(String, ForeignKey("users.id"), nullable=True)
    comment = Column(String)
    status = Column(String)
    file_path = Column(String)

    # Relationships
    document = relationship("Document", back_populates="versions")
