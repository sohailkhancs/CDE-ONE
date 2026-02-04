import sqlite3
import os

db_path = 'backend/cde_one.db'
if not os.path.exists(db_path):
    print(f"DB not found at {db_path}")
    # try direct in backend
    db_path = 'cde_one.db'
    if not os.path.exists(db_path):
         db_path = '../../backend/cde_one.db'

print(f"Inspecting {db_path}...")
try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("\n--- USERS ---")
    cursor.execute("SELECT id, email, role FROM users")
    for row in cursor.fetchall():
        print(row)
        
    print("\n--- DOCUMENTS ---")
    cursor.execute("SELECT id, name, status, author_id FROM documents")
    for row in cursor.fetchall():
        print(row)
    
    conn.close()
except Exception as e:
    print(f"Error: {e}")
