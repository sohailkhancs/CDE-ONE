from datetime import timedelta, datetime
from typing import Annotated
import json
import os

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash
)
from app.db.database import get_db
from app.models.user import User
from app.schemas.auth import Token, TokenPayload, LoginRequest, UserResponse, UserCreate

# Security audit log directory for ISO 19650 compliance
SECURITY_LOG_DIR = "audit_logs"
os.makedirs(SECURITY_LOG_DIR, exist_ok=True)


def security_audit_log(
    action: str,
    user_id: str = None,
    user_email: str = None,
    user_role: str = None,
    success: bool = True,
    status_code: int = 200,
    details: dict = None
):
    """Write security audit log entry for authentication events."""
    log_entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "action": action,
        "user": {
            "id": user_id,
            "email": user_email,
            "role": user_role
        },
        "outcome": {
            "success": success,
            "status_code": status_code
        },
        "details": details or {}
    }

    log_file = os.path.join(
        SECURITY_LOG_DIR,
        f"security_{datetime.utcnow().strftime('%Y%m%d')}.log"
    )

    try:
        with open(log_file, "a") as f:
            f.write(json.dumps(log_entry) + "\n")
    except Exception as e:
        print(f"Failed to write security audit log: {e}")

router = APIRouter(prefix="/auth", tags=["Authentication"])
settings = get_settings()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_token(token)
    if payload is None or payload.get("type") != "access":
        raise credentials_exception

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    return user


def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    """Verify user is active."""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


@router.post("/login", response_model=Token)
async def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user and return tokens.

    Security: Failed login attempts are logged for security monitoring.
    """
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        # Log failed login attempt
        security_audit_log(
            action="auth.login.failed",
            user_email=credentials.email,
            success=False,
            status_code=401,
            details={"reason": "invalid_credentials" if user else "user_not_found"}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Log successful login
    security_audit_log(
        action="auth.login.success",
        user_id=user.id,
        user_email=user.email,
        user_role=user.role,
        success=True
    )

    # Create tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": user.id})

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user)
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(request: dict, db: Session = Depends(get_db)):
    """Refresh access token using refresh token."""
    refresh_token = request.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="refresh_token is required"
        )

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_token(refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise credentials_exception

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    # Create new tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    new_refresh_token = create_refresh_token(data={"sub": user.id})

    return Token(
        access_token=access_token,
        refresh_token=new_refresh_token,
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    """Get current user info."""
    return UserResponse.model_validate(current_user)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.

    Security: New user registrations are logged for audit trail.
    """
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        security_audit_log(
            action="auth.register.failed",
            user_email=user_data.email,
            success=False,
            status_code=400,
            details={"reason": "email_already_exists", "role": user_data.role}
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    import uuid
    new_user = User(
        id=str(uuid.uuid4()),
        email=user_data.email,
        name=user_data.name,
        hashed_password=get_password_hash(user_data.password),
        role=user_data.role,
        avatar=user_data.name[0].upper()
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Log successful registration
    security_audit_log(
        action="auth.register.success",
        user_id=new_user.id,
        user_email=new_user.email,
        user_role=new_user.role,
        success=True,
        details={"registered_by": "self_registration"}
    )

    return UserResponse.model_validate(new_user)
