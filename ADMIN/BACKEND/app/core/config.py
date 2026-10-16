from pydantic_settings import BaseSettings
from typing import Optional, List
import os

class AdminSettings(BaseSettings):
    ADMIN_HOST: str = "127.0.0.1"
    ADMIN_PORT: int = 60136
    ADMIN_UI_ORIGIN: str = "http://127.0.0.1:60135"
    ENVIRONMENT: str = "local_admin"
    VERSION: str = "1.0.0"
    
    # Server-side secrets - NEVER exposed to browser code
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://ledjnqvcyzqledcibjpd.supabase.co")
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = os.getenv("SUPABASE_SERVICE_ROLE_KEY", None)
    SUPABASE_JWT_SECRET: Optional[str] = os.getenv("SUPABASE_JWT_SECRET", "super-secret-jwt-token-with-at-least-32-bytes-length")
    
    # Security Configuration
    STRICT_LOOPBACK_ONLY: bool = True
    ALLOWED_HOSTS: List[str] = ["127.0.0.1", "localhost", "::1", "testclient"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = AdminSettings()
