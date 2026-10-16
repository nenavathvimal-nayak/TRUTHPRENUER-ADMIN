import jwt
from typing import Optional, Dict, Any, List
from enum import Enum
from pydantic import BaseModel, Field
from app.core.config import settings

class Role(str, Enum):
    ANONYMOUS = "Anonymous"
    FOUNDER = "Founder"
    INVESTOR = "Investor"
    REVIEWER = "Reviewer"
    MODERATOR = "Moderator"
    ADMIN = "Admin"
    SUPER_ADMIN = "Super_Admin"
    SECURITY = "Security"

class AuthenticatedUser(BaseModel):
    id: str
    email: Optional[str] = None
    role: str = Role.FOUNDER.value
    is_suspended: bool = False
    is_signature_verified: bool = False
    raw_claims: Dict[str, Any] = Field(default_factory=dict)

    @property
    def is_admin(self) -> bool:
        return self.is_signature_verified and self.role in [Role.ADMIN.value, Role.SUPER_ADMIN.value, Role.SECURITY.value]

    @property
    def is_moderator(self) -> bool:
        return self.is_signature_verified and (self.is_admin or self.role == Role.MODERATOR.value)

def verify_jwt_token(token: str) -> Optional[AuthenticatedUser]:
    """
    Cryptographically verify Supabase JWT token.
    Fails closed if signature is invalid, expired, or malformed.
    """
    if not token or not token.strip():
        return None

    secret = settings.SUPABASE_JWT_SECRET
    if not secret or not secret.strip():
        return None

    try:
        payload = jwt.decode(
            token,
            secret,
            algorithms=["HS256"],
            options={"verify_signature": True, "verify_exp": True}
        )
    except (jwt.PyJWTError, Exception):
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    app_meta = payload.get("app_metadata", {})
    user_meta = payload.get("user_metadata", {})
    role = app_meta.get("role") or user_meta.get("role") or Role.FOUNDER.value

    return AuthenticatedUser(
        id=user_id,
        email=payload.get("email"),
        role=role,
        is_suspended=payload.get("is_suspended", False),
        is_signature_verified=True,
        raw_claims=payload
    )
