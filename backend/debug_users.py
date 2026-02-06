import sys
sys.path.append('.')
from app.db.database import SessionLocal
from app.models.user import User

def list_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Total users: {len(users)}")
        for u in users:
            print(f"ID: {u.id} | Email: {u.email} | Role: {u.role}")
    finally:
        db.close()

if __name__ == "__main__":
    list_users()
