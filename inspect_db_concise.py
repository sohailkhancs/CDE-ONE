import sqlite3
import os

db_path = 'backend/cde_one.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("USERS:")
cursor.execute("SELECT id, email, role FROM users")
for row in cursor.fetchall():
    print(f"U: {row}")

print("\nDOCS:")
cursor.execute("SELECT id, name, status, author_id FROM documents")
for row in cursor.fetchall():
    print(f"D: {row}")

conn.close()
