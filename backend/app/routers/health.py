"""
Health Check Router — B-H9
Provides /health/detailed for DB + environment status.
Used by load-test warmup, monitoring, and automation suite readiness checks.
"""
import time
from fastapi import APIRouter
from sqlalchemy import text
from app.database import AsyncSessionLocal


router = APIRouter(prefix="/health", tags=["health"])


@router.get("/detailed", summary="Detailed health check — DB + system info")
async def health_detailed():
    """
    Returns detailed health of all downstream dependencies.
    Automation tests should call this before starting a run to confirm
    the environment is warm and ready.
    """
    start = time.perf_counter()
    db_status = "healthy"
    db_ping_ms = None

    try:
        async with AsyncSessionLocal() as session:
            t0 = time.perf_counter()
            await session.execute(text("SELECT 1"))
            db_ping_ms = round((time.perf_counter() - t0) * 1000, 2)

    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "version": "3.0.0",
        "checks": {
            "database": {
                "status": db_status,
                "ping_ms": db_ping_ms,
            },
        },
        "uptime_check_ms": round((time.perf_counter() - start) * 1000, 2),
    }


@router.get("/ready", summary="Kubernetes-style readiness probe")
async def health_ready():
    """Returns 200 when the application is ready to serve traffic."""
    return {"ready": True}
