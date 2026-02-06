import sys
sys.path.append('.')
from app.db.database import engine
from sqlalchemy import text

def manage_users_v4():
    log = []
    def audit(msg):
        print(msg)
        log.append(msg)

    target_email = 'admin@skyline.com'
    new_admin_id = 'user-001' # admin@cde-one.com

    with engine.connect() as conn:
        trans = conn.begin()
        try:
            # Get target ID
            target_id = conn.execute(text("SELECT id FROM users WHERE email = :email"), {"email": target_email}).scalar()
            
            if not target_id:
                audit(f"User {target_email} not found.")
                return

            audit(f"Found target user {target_email} (ID: {target_id}). Starting cleanup...")

            # 1. document_versions (from previous error)
            # Check column name if unsure, but error said 'author_id'
            res = conn.execute(text("UPDATE document_versions SET author_id = :new_id WHERE author_id = :old_id"), 
                               {"new_id": new_admin_id, "old_id": target_id})
            audit(f"Reassigned {res.rowcount} document_versions.")

            # 2. team_members (assigned_by)
            res = conn.execute(text("UPDATE team_members SET assigned_by = :new_id WHERE assigned_by = :old_id"), 
                               {"new_id": new_admin_id, "old_id": target_id})
            audit(f"Reassigned {res.rowcount} team_members (assigned_by).")

            # 3. team_members (membership) -> DELETE
            res = conn.execute(text("DELETE FROM team_members WHERE user_id = :old_id"), 
                               {"old_id": target_id})
            audit(f"Deleted {res.rowcount} team_members records.")

            # 4. inspections (assigned_to)
            res = conn.execute(text("UPDATE inspections SET assigned_to = :new_id WHERE assigned_to = :old_id"), 
                               {"new_id": new_admin_id, "old_id": target_id})
            audit(f"Reassigned {res.rowcount} inspections.")
            
            # 5. audit_logs (user_id)
            res = conn.execute(text("UPDATE audit_logs SET user_id = :new_id WHERE user_id = :old_id"), 
                               {"new_id": new_admin_id, "old_id": target_id})
            audit(f"Reassigned {res.rowcount} audit_logs.")

            # 6. projects (created_by)
            # Also owner_id if exists, but ignoring owner_id based on previous error
            try:
                res = conn.execute(text("UPDATE projects SET created_by = :new_id WHERE created_by = :old_id"), 
                                   {"new_id": new_admin_id, "old_id": target_id})
                audit(f"Reassigned {res.rowcount} projects (created_by).")
            except Exception as e:
                audit(f"Could not reassign projects created_by (might not exist?): {e}")

            # 7. documents (author_id) - Already done in v3 but good to repeat if v3 rolled back?
            # V3 might have rolled back due to error.
            res = conn.execute(text("UPDATE documents SET author_id = :new_id WHERE author_id = :old_id"), 
                               {"new_id": new_admin_id, "old_id": target_id})
            audit(f"Reassigned {res.rowcount} documents.")

            # Finally DELETE USER
            res = conn.execute(text("DELETE FROM users WHERE id = :old_id"), {"old_id": target_id})
            audit(f"Deleted user {target_email}. Rows affected: {res.rowcount}")

            trans.commit()
            audit("Transaction COMMITTED.")
            
        except Exception as e:
            trans.rollback()
            audit(f"Transaction FAILED: {e}")
            
    # Verify
    with engine.connect() as conn:
        users = conn.execute(text("SELECT email, role FROM users")).fetchall()
        audit("\nFinal User List:")
        for u in users:
            audit(f"- {u.email} ({u.role})")

    with open('cleanup_log.txt', 'w') as f:
        f.write("\n".join(log))

if __name__ == "__main__":
    manage_users_v4()
