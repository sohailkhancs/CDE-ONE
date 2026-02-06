"""Create admin user with known password for testing."""
import sys
sys.path.append('.')

from app.db.database import engine, SessionLocal
from app.models.user import User
from app.core.security import get_password_hash
from sqlalchemy import text

def create_admin_user():
    """Create admin user with known credentials."""
    db = SessionLocal()

    try:
        # Check if admin exists
        existing = db.query(User).filter(User.email == "admin@cde-one.com").first()
        if existing:
            print("Admin user already exists, updating password...")
            existing.hashed_password = get_password_hash("Admin@123")
            existing.is_active = True
        else:
            # Create new admin user
            admin_user = User(
                id="user-admin-001",
                email="admin@cde-one.com",
                name="Admin User",
                hashed_password=get_password_hash("Admin@123"),
                role="Admin",
                is_active=True,
                avatar="A"
            )
            db.add(admin_user)
            print("Created new admin user")

        db.commit()
        print("\nAdmin credentials:")
        print("  Email: admin@cde-one.com")
        print("  Password: Admin@123")
        print("  Role: Admin")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
