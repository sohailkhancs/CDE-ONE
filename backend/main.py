from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.database import engine, Base, get_db
from app.routers import auth, documents, inspections, planner, team, dashboard, audit

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Create tables
    Base.metadata.create_all(bind=engine)
    yield
    # Cleanup
    engine.dispose()


# Create FastAPI app
app = FastAPI(
    title="CDE-ONE API",
    description="Common Data Environment for Construction Projects",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS - Allow multiple common development ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "message": "CDE-ONE Backend Online",
        "environment": settings.ENVIRONMENT
    }


# API v1 router
from fastapi import APIRouter

api_v1 = APIRouter(prefix="/api/v1", tags=["Root"])

# Include all routers
api_v1.include_router(auth.router)
api_v1.include_router(documents.router)
api_v1.include_router(inspections.router)
api_v1.include_router(planner.router)
api_v1.include_router(team.router)
api_v1.include_router(dashboard.router)
api_v1.include_router(audit.router)

app.include_router(api_v1)


# Root endpoint
@app.get("/")
def root():
    """Root endpoint with API information."""
    return {
        "name": "CDE-ONE API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "api_v1": "/api/v1"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
