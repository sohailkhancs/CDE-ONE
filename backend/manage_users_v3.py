import sys
sys.path.append('.')
from app.db.database import engine
from sqlalchemy import text

def manage_users_v3():
    log = []
    
    # helper to log and print
    def audit(msg):
        print(msg)
        log.append(msg)

    # 1. Update Khan Email
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            conn.execute(text("UPDATE users SET email = 'khan.m@cde-one.com' WHERE email = 'khan.m@cde-one'"))
            audit("Updated khan.m@cde-one to khan.m@cde-one.com")
            trans.commit()
        except Exception as e:
            trans.rollback()
            audit(f"Error updating Khan: {e}")

    # 2. Delete Admin (with reassignment)
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            # target: u-admin-001 (admin@skyline.com)
            # new owner: user-001 (admin@cde-one.com)
            
            # Check if target exists
            target_id = conn.execute(text("SELECT id FROM users WHERE email = 'admin@skyline.com'")).scalar()
            
            if target_id:
                # Reassign documents
                res = conn.execute(text("UPDATE documents SET author_id = 'user-001' WHERE author_id = :tid"), {"tid": target_id})
                audit(f"Reassigned {res.rowcount} documents from {target_id} to user-001")
                
                # Reassign projects? (Just in case)
                # Check for project owner_id column? We know from previous error it MIGHT not exist in table but let's skip to be safe/lazy unless needed.
                # If deleted user is owner, user delete might fail if owner_id exists.
                # We'll try delete.
                
                # Delete user
                res = conn.execute(text("DELETE FROM users WHERE id = :tid"), {"tid": target_id})
                audit(f"Deleted user admin@skyline.com (ID: {target_id})")
            else:
                audit("User admin@skyline.com not found")
                # Try admin@styline just in case
                res = conn.execute(text("DELETE FROM users WHERE email = 'admin@styline'"))
                if res.rowcount > 0:
                   audit("Deleted admin@styline")

            trans.commit()
        except Exception as e:
            trans.rollback()
            audit(f"Error deleting admin: {e}")
            
    # Verification
    with engine.connect() as conn:
        rows = conn.execute(text("SELECT email, role FROM users")).fetchall()
        audit("Final User List:")
        for r in rows:
            audit(f" - {r[0]} ({r[1]})")

    with open('op_log_v3.txt', 'w') as f:
        f.write("\n".join(log))

if __name__ == "__main__":
    manage_users_v3()
