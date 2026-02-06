import sys
sys.path.append('.')
from app.db.database import engine
from sqlalchemy import text

def raw_fix():
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            # 1. Update Khan's email
            # Check if khan.m@cde-one exists
            result = conn.execute(text("SELECT id FROM users WHERE email = 'khan.m@cde-one'"))
            user = result.fetchone()
            if user:
                conn.execute(text("UPDATE users SET email = 'khan.m@cde-one.com' WHERE email = 'khan.m@cde-one'"))
                print("Updated khan.m@cde-one to khan.m@cde-one.com")
            else:
                # Check if already correct
                result = conn.execute(text("SELECT id FROM users WHERE email = 'khan.m@cde-one.com'"))
                if result.fetchone():
                    print("khan.m@cde-one.com already correct")
                else:
                    print("Warning: khan.m@cde-one not found to update (maybe checked already?)")

            # 2. Delete admin@styline
            result = conn.execute(text("DELETE FROM users WHERE email = 'admin@styline'"))
            if result.rowcount > 0:
                print(f"Deleted admin@styline")
            else:
                print("admin@styline not found")

            # 3. Delete admin@skyline.com (The likely target)
            # Check if it has dependent records first? 
            # If we delete and it fails, transaction rolls back.
            # We'll try to delete. 
            try:
                result = conn.execute(text("DELETE FROM users WHERE email = 'admin@skyline.com'"))
                if result.rowcount > 0:
                    print(f"Deleted admin@skyline.com")
                else:
                    print("admin@skyline.com not found")
            except Exception as e:
                print(f"Could not delete admin@skyline.com due to constraint: {e}")
                
            trans.commit()
            print("Changes committed.")
            
        except Exception as e:
            trans.rollback()
            print(f"Error executing raw SQL: {e}")

if __name__ == "__main__":
    raw_fix()
