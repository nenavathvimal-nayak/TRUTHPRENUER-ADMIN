from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api.v1.admin import router as admin_router

app = FastAPI(
    title="Truthprenuer Local Admin API",
    description="Localhost-only privileged administrative API for Truthprenuer Admin Console",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url=None
)

# Enforce strict CORS restricted to the local Admin UI port
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.ADMIN_UI_ORIGIN, "http://localhost:60135"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.middleware("http")
async def enforce_loopback_isolation(request: Request, call_next):
    """
    Global middleware verifying request is strictly from loopback.
    """
    client_ip = request.client.host if request.client else "unknown"
    if client_ip not in settings.ALLOWED_HOSTS:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": f"Access Denied: External IP {client_ip} cannot reach local Admin API"}
        )
    return await call_next(request)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Truthprenuer Local Admin API",
        "interface": settings.ADMIN_HOST,
        "port": settings.ADMIN_PORT,
        "ui_origin": settings.ADMIN_UI_ORIGIN,
        "version": settings.VERSION
    }

app.include_router(admin_router)
