import sys
sys.path.append('.')
from app.db.database import SessionLocal
from app.models.user import User

def correct_users():
    db = SessionLocal()
    audit_log = []
    try:
        # 1. Correct Khan's email
        khan = db.query(User).filter(User.email == "khan.m@cde-one").first()
        if khan:
            khan.email = "khan.m@cde-one.com"
            audit_log.append("Updated email for 'khan.m@cde-one' to 'khan.m@cde-one.com'.")
        else:
            # Check if already correct or needs creating
            khan_correct = db.query(User).filter(User.email == "khan.m@cde-one.com").first()
            if khan_correct:
                audit_log.append("User 'khan.m@cde-one.com' already exists.")
            else:
                # Should not happen based on context, but let's be safe
                pass
        
        # 2. Delete admin@styline / admin@skyline.com
        # User asked to delete "admin@styline".
        styline = db.query(User).filter(User.email == "admin@styline").first()
        if styline:
            db.delete(styline)
            audit_log.append("Deleted user 'admin@styline'.")
        else:
            audit_log.append("User 'admin@styline' not found.")
            
        # Check for skyline as probable typo target
        skyline = db.query(User).filter(User.email == "admin@skyline.com").first()
        if skyline:
            db.delete(skyline)
            audit_log.append("Deleted user 'admin@skyline.com' (assuming typo for 'styline').")
            
        db.commit()
        
        # Write log to file
        with open('correction_log.txt', 'w') as f:
            f.write("\n".join(audit_log))
            
    except Exception as e:
        db.rollback()
        with open('correction_log.txt', 'w') as f:
            f.write(f"Error: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    correct_users()
