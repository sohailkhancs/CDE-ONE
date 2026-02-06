import sys
sys.path.append('.')
from app.db.database import engine
from sqlalchemy import text

def final_fix():
    log = []
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            # 1. Update Khan email
            # Just do the update and check rowcount
            result = conn.execute(text("UPDATE users SET email = 'khan.m@cde-one.com' WHERE email = 'khan.m@cde-one'"))
            log.append(f"Updated khan email. Rows affected: {result.rowcount}")

            # 2. Delete admin@styline
            result = conn.execute(text("DELETE FROM users WHERE email = 'admin@styline'"))
            log.append(f"Deleted admin@styline. Rows affected: {result.rowcount}")

            # 3. Delete admin@skyline.com
            try:
                # First check dependencies? No, just try delete.
                result = conn.execute(text("DELETE FROM users WHERE email = 'admin@skyline.com'"))
                log.append(f"Deleted admin@skyline.com. Rows affected: {result.rowcount}")
            except Exception as e:
                log.append(f"Failed to delete admin@skyline.com: {e}")

            trans.commit()
            log.append("Transaction committed.")
            
            # 4. Verify
            rows = conn.execute(text("SELECT email, role FROM users")).fetchall()
            log.append("Current Users:")
            for r in rows:
                log.append(f"  {r[0]} ({r[1]})")

        except Exception as e:
            trans.rollback()
            log.append(f"Transaction FAILED and Rolled Back: {e}")

    with open('final_fix_log.txt', 'w') as f:
        f.write("\n".join(log))

if __name__ == "__main__":
    final_fix()
