import sqlite3
import os

db_path = 'backend/cde_one.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("ALEX SEARCH:")
cursor.execute("SELECT id, email, role FROM users WHERE email LIKE '%alex%'")
alex = cursor.fetchone()
print(f"Alex User: {alex}")

if alex:
    alex_id = alex[0]
    print("\nADMIN WIP DOCS VISIBLE TO ALEX?")
    # These are docs with status S0 and NOT authored by Alex
    cursor.execute("SELECT id, name, status, author_id FROM documents WHERE status='S0' AND author_id != ?", (alex_id,))
    admin_docs = cursor.fetchall()
    print(f"Found {len(admin_docs)} WIP docs NOT by Alex.")
    for d in admin_docs:
        print(f"Doc: {d}")

conn.close()
