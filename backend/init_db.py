"""Initialize database with seed data."""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.db.database import engine, Base, SessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.models.project import Project
from app.models.document import Document, DocumentVersion
from app.models.inspection import Inspection, ChecklistItem
from app.models.task import PlannedTask, FieldTask
import uuid


def get_utc_now():
    """Get current UTC datetime as timezone-aware object."""
    return datetime.now(timezone.utc)


def init_db(drop_all=False):
    """
    Initialize database with tables and seed data.

    Args:
        drop_all: If True, drop all existing tables before recreation.
                  Use with caution - this will delete all data!
    """
    if drop_all:
        print("Dropping all existing tables...")
        Base.metadata.drop_all(bind=engine)

    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")

    db = SessionLocal()

    try:
        # Check if data already exists
        if db.query(User).filter(User.email == "admin@skyline.com").first():
            print("Database already seeded. Skipping...")
            return

        print("Seeding database with initial data...")

        # Create admin user (short password for bcrypt compatibility)
        admin_user = User(
            id="u-admin-001",
            email="admin@skyline.com",
            name="Admin User",
            hashed_password=get_password_hash("admin123"),  # Short password
            role="Admin",
            avatar="A",
            is_active=True
        )
        db.add(admin_user)

        # Create project manager
        pm_user = User(
            id="u-pm-001",
            email="alex.m@skyline.com",
            name="Alex Mercer",
            hashed_password=get_password_hash("pm123"),  # Short password
            role="Project Manager",
            avatar="A",
            is_active=True
        )
        db.add(pm_user)

        # Create project
        project = Project(
            id="proj-skyline-p2",
            name="Skyline Tower Phase 2",
            code="ST-P2",
            description="Commercial construction project in downtown area",
            status="Active",
            owner_id=pm_user.id
        )
        db.add(project)

        # Create sample documents
        doc1 = Document(
            id="f1",
            project_id=project.id,
            name="A-101_L1_Floorplan.pdf",
            revision="C03",
            status="S4",
            size="2.4 MB",
            discipline="Architecture",
            author_id=pm_user.id,
            description="Ground floor layout including room schedules",
            container_type="D1",
            originator="ARC"
        )
        db.add(doc1)

        # Add version for doc1
        version1 = DocumentVersion(
            id="v1-1",
            document_id=doc1.id,
            revision="C03",
            author_id=pm_user.id,
            comment="Final coordination issue",
            status="S4",
            date=get_utc_now()
        )
        db.add(version1)

        doc2 = Document(
            id="wip-1",
            project_id=project.id,
            name="A-SK-001_Sketch_Entryway.dwg",
            revision="P01",
            status="S0",
            size="12.4 MB",
            discipline="Architecture",
            author_id=pm_user.id,
            description="Initial sketch for the main entrance redesign",
            container_type="M3",
            originator="ARC"
        )
        db.add(doc2)

        # Create sample inspection
        inspection = Inspection(
            id="INS-001",
            project_id=project.id,
            title="Reinforcement Pre-Pour Inspection",
            type="QC",
            status="In Progress",
            location="L2 Zone A - Foundation Slabs",
            assigned_to=pm_user.id,
            date=get_utc_now() + timedelta(days=1),
            iso_suitability="S3",
            ref_container_id="f1"
        )
        db.add(inspection)

        # Add checklist items
        checklist1 = ChecklistItem(
            id="ci-1",
            inspection_id=inspection.id,
            label="Rebar spacing matches structural drawings",
            checked=True,
            status="Pass",
            order=0
        )
        db.add(checklist1)

        checklist2 = ChecklistItem(
            id="ci-2",
            inspection_id=inspection.id,
            label="Concrete cover depth adequate",
            checked=False,
            status="Pass",
            order=1
        )
        db.add(checklist2)

        # Create sample planned tasks
        task1 = PlannedTask(
            id="t1",
            project_id=project.id,
            wbs="1",
            name="Project Mobilization",
            start=get_utc_now(),
            finish=get_utc_now() + timedelta(days=14),
            duration=14,
            progress=100,
            resource="Site Team",
            outline_level=1,
            is_expanded=True,
            is_critical=True
        )
        db.add(task1)

        task2 = PlannedTask(
            id="t2",
            project_id=project.id,
            wbs="1.1",
            name="Site Office Setup",
            start=get_utc_now(),
            finish=get_utc_now() + timedelta(days=4),
            duration=4,
            progress=100,
            resource="Admin",
            outline_level=2
        )
        db.add(task2)

        # Create sample field task
        field_task = FieldTask(
            id="ft1",
            project_id=project.id,
            type="Defect",
            status="Open",
            title="Cracked Tile in Lobby",
            location_x=30.0,
            location_y=40.0,
            assignee="John Doe",
            priority="High",
            due_date=get_utc_now() + timedelta(days=7),
            discipline="Architecture",
            description="Visible crack in main lobby floor tile near entrance"
        )
        db.add(field_task)

        db.commit()
        print("Database seeded successfully!")
        print("\n" + "="*50)
        print("Default users created:")
        print("  Admin: admin@skyline.com / admin123")
        print("  PM:    alex.m@skyline.com / pm123")
        print("="*50)

    except Exception as e:
        print(f"Error seeding database: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Initialize the database")
    parser.add_argument("--drop", action="store_true", help="Drop all tables before recreation")
    args = parser.parse_args()

    init_db(drop_all=args.drop)
