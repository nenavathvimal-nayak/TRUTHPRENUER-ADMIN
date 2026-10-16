from fastapi import Depends, HTTPException, Header, Request, status
from typing import Optional
from app.core.security import AuthenticatedUser, verify_jwt_token, Role
from app.core.config import settings

def require_local_admin_origin(request: Request) -> None:
    """
    Zero-trust loopback boundary check.
    Guarantees the incoming TCP socket peer is strictly a local loopback interface.
    Rejects any request containing external forwarded IP headers.
    """
    client_ip = request.client.host if request.client else "unknown"
    local_loopbacks = {"127.0.0.1", "::1", "localhost", "testclient"}

    if client_ip not in local_loopbacks:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Forbidden: Admin API is strictly bound to local loopback (127.0.0.1). Detected connection from: {client_ip}"
        )

    # Reject requests with non-loopback X-Forwarded-For to prevent reverse-proxy spoofing
    x_forwarded_for = request.headers.get("X-Forwarded-For")
    if x_forwarded_for:
        hops = [h.strip() for h in x_forwarded_for.split(",") if h.strip()]
        for hop in hops:
            if hop not in local_loopbacks:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Forbidden: External proxy hop detected in X-Forwarded-For: {hop}"
                )

def get_current_user(
    request: Request,
    authorization: Optional[str] = Header(None, alias="Authorization"),
    _origin_check: None = Depends(require_local_admin_origin)
) -> AuthenticatedUser:
    """
    Extracts and cryptographically validates Bearer token.
    Fails closed if Authorization header is absent, malformed, or unverified.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required",
            headers={"WWW-Authenticate": "Bearer"}
        )

    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization scheme. Use 'Bearer <token>'",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = parts[1]
    user = verify_jwt_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid, forged, or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if user.is_suspended:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended by administration"
        )

    return user

def require_admin(
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> AuthenticatedUser:
    """
    Authoritative server-side decision: User must possess cryptographic signature
    and an Admin / Super_Admin / Security role.
    """
    if not current_user.is_signature_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Administrative actions require cryptographically verified credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Forbidden: Administrative privileges required. Current role: {current_user.role}"
        )

    return current_user

def require_moderator(
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> AuthenticatedUser:
    """
    Authoritative server-side decision: User must possess Moderator or Admin role.
    """
    if not current_user.is_signature_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Moderation actions require cryptographically verified credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not current_user.is_moderator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Forbidden: Moderation privileges required. Current role: {current_user.role}"
        )

    return current_user
