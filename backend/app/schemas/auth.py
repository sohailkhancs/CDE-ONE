from pydantic import BaseModel, EmailStr
from typing import Optional


class TokenPayload(BaseModel):
    """JWT token payload."""
    sub: str  # user ID
    type: str  # access or refresh


class Token(BaseModel):
    """Token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class LoginRequest(BaseModel):
    """Login request."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """User response."""
    id: str
    email: str
    name: str
    role: str  # Admin, Project Manager, Viewer
    avatar: Optional[str] = None

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    """User creation request."""
    email: EmailStr
    name: str
    password: str
    role: str = "Viewer"


class UserUpdate(BaseModel):
    """User update request."""
    name: Optional[str] = None
    role: Optional[str] = None
