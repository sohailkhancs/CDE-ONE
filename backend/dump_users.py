import sys
sys.path.append('.')
from app.db.database import SessionLocal
from app.models.user import User

def dump_users():
    db = SessionLocal()
    with open('user_dump.txt', 'w') as f:
        try:
            users = db.query(User).all()
            f.write(f"Total users: {len(users)}\n")
            for u in users:
                f.write(f"ID: {u.id} | Email: '{u.email}' | Role: {u.role}\n")
        except Exception as e:
            f.write(f"Error: {str(e)}\n")
        finally:
            db.close()

if __name__ == "__main__":
    dump_users()
