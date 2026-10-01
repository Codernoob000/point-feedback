import os
import sys
import logging
from pathlib import Path
from dotenv import load_dotenv

# Ensure api directory is in sys.path
api_dir = str(Path(__file__).resolve().parent)
if api_dir not in sys.path:
    sys.path.insert(0, api_dir)

# Load environment variables (.env in workspace root and apps/api)
load_dotenv()
load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env")

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi.errors import RateLimitExceeded
from database import engine, Base, SessionLocal
from models import Project, Feedback
from seed import seed_database_if_empty
from limiter import limiter
from routes.auth import router as auth_router
from routes.feedback import router as feedback_router
from routes.analytics import router as analytics_router
from routes.projects import router as projects_router
from routes.upload import router as upload_router
from fastapi.staticfiles import StaticFiles

logger = logging.getLogger("point_feedback")

# Ensure DB tables exist
Base.metadata.create_all(bind=engine)

# Seed sample data on first run
db = SessionLocal()
try:
    seed_database_if_empty(db)
finally:
    db.close()

app = FastAPI(
    title="POINT.FEEDBACK API",
    description="Developer-grade visual feedback platform API",
    version="1.0.0"
)

# Connect slowapi limiter
app.state.limiter = limiter
# Hardened CORS configuration
allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if allowed_origins_env:
    allowed_origins = [orig.strip() for orig in allowed_origins_env.split(",") if orig.strip()]
else:
    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:4173",
        "http://localhost:3000",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:4173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5174",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Centralized Exception Handlers (Fix 7)
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    msg = exc.detail if isinstance(exc.detail, str) else "Request error"
    details = exc.detail if not isinstance(exc.detail, str) else None
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": msg,
            "details": details
        },
        headers=getattr(exc, "headers", None)
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "message": "Validation error",
            "details": exc.errors()
        }
    )

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "success": False,
            "message": "Too Many Requests",
            "details": str(exc.detail)
        }
    )

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled server exception: %s", exc)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal server error",
            "details": None
        }
    )

# Static file serving for uploads (screenshots & audio)
upload_dir = Path(__file__).resolve().parent / "uploads"
upload_dir.mkdir(parents=True, exist_ok=True)
(upload_dir / "screenshots").mkdir(parents=True, exist_ok=True)
(upload_dir / "audio").mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")

# Include API v1 routers
app.include_router(feedback_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(projects_router, prefix="/api/v1")
app.include_router(auth_router)
app.include_router(upload_router)
@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "POINT.FEEDBACK API",
        "version": "1.0.0"
    }

@app.get("/")
def root():
    return {
        "name": "POINT.FEEDBACK",
        "tagline": "Point. Speak. Fix.",
        "docs": "/docs",
        "api_v1": "/api/v1"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

