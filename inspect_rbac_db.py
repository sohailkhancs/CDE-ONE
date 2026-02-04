import sys
import os

# Add the backend directory to the path so we can import from app
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.db.database import SessionLocal
from app.models.user import User
from app.models.document import Document

def inspect_db():
    db = SessionLocal()
    try:
        print("--- USERS ---")
        users = db.query(User).all()
        for u in users:
            print(f"ID: {u.id}, Email: {u.email}, Role: {u.role}")

        print("\n--- DOCUMENTS ---")
        docs = db.query(Document).all()
        for d in docs:
            print(f"ID: {d.id}, Name: {d.name}, Status: {d.status}, AuthorID: {d.author_id}")
    finally:
        db.close()

if __name__ == "__main__":
    inspect_db()
