"""
ConstructOS Backend - FastAPI Application
ISO 19650 Compliant Common Data Environment
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    logger.info("🚀 Starting ConstructOS Backend...")
    # Startup: Initialize database connections, etc.
    yield
    # Shutdown: Cleanup resources
    logger.info("🛑 Shutting down ConstructOS Backend...")


# Create FastAPI app with lifespan
app = FastAPI(
    title="ConstructOS API",
    description="ISO 19650 Compliant Common Data Environment Backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware Configuration
# Allow React App to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative dev server
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://cde-one.netlify.app"  # <--- ADD THIS LINE
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# Health Check Endpoint
@app.get("/api/v1/health")
def health_check():
    """Health check endpoint to verify backend is running."""
    return {
        "status": "ok",
        "message": "ConstructOS Backend Online - RBAC ACTIVE",
        "service": "ConstructOS CDE",
        "version": "1.0.0"
    }


# Root endpoint
@app.get("/")
def root():
    """Root endpoint with API information."""
    return {
        "name": "ConstructOS API",
        "description": "ISO 19650 Compliant Common Data Environment",
        "docs": "/docs",
        "health": "/api/v1/health"
    }


# Import and include routers
from app.routers import auth, documents, admin

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["Documents"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
