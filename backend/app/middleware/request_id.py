"""
Request ID & Response Timing Middleware
Adds X-Request-ID and X-Response-Time headers to every response.
Enables log correlation and performance measurement in automation tests.
"""
import time
import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Injects a unique X-Request-ID into every request/response cycle."""

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        # Store on request state for downstream access (e.g., audit logs)
        request.state.request_id = request_id

        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response


class ResponseTimingMiddleware(BaseHTTPMiddleware):
    """Adds X-Response-Time header (milliseconds) — useful for performance assertions in tests."""

    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start) * 1000, 2)
        response.headers["X-Response-Time"] = f"{duration_ms}ms"
        return response
