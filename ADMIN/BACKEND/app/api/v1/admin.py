from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.api.deps import require_admin, require_moderator, require_local_admin_origin
from app.core.security import AuthenticatedUser
from app.services.audit_service import audit_service, AuditLogEntry
from app.services.moderation_service import moderation_service, ModerationReport
from app.core.config import settings

router = APIRouter(prefix="/api/v1/admin", tags=["Local Privileged Admin API"])

class SuspendUserRequest(BaseModel):
    reason: str = Field(..., min_length=5, max_length=500, description="Justification for suspension")
    duration_days: Optional[int] = Field(default=None, ge=1, le=365)

class RestoreUserRequest(BaseModel):
    reason: str = Field(..., min_length=5, max_length=500, description="Justification for restoration")

class ReportActionRequest(BaseModel):
    action: str = Field(..., pattern="^(dismiss|remove_content|warn_user|quarantine)$")
    reason: str = Field(..., min_length=3, max_length=500)

class SystemOverviewResponse(BaseModel):
    service: str
    environment: str
    version: str
    admin_ui_port: int
    admin_api_port: int
    total_audit_events: int
    zero_trust_edge: bool
    fail_closed: bool

@router.get("/audit-logs", response_model=List[AuditLogEntry])
def get_audit_logs(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    action: Optional[str] = Query(default=None),
    admin: AuthenticatedUser = Depends(require_admin)
):
    """
    Query tamper-evident audit logs. Strictly protected by Admin RBAC.
    """
    return audit_service.query(limit=limit, offset=offset, action=action)

@router.post("/users/{user_id}/suspend")
def suspend_user(
    user_id: str,
    body: SuspendUserRequest,
    request: Request,
    admin: AuthenticatedUser = Depends(require_admin)
):
    """
    Suspend a user account with explicit audit logging. Prevents self-suspension.
    """
    if admin.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot perform administrative suspension on your own session"
        )

    record = moderation_service.suspend_user(
        user_id=user_id,
        admin_id=admin.id,
        reason=body.reason,
        duration_days=body.duration_days
    )

    client_ip = request.client.host if request.client else "unknown"
    audit_service.record(
        actor_id=admin.id,
        actor_role=admin.role,
        action="USER_SUSPENDED",
        target_type="user",
        target_id=user_id,
        result="SUCCESS",
        ip_address=client_ip,
        reason=body.reason,
        details={"duration_days": body.duration_days}
    )

    return {
        "status": "success",
        "message": f"User {user_id} suspended successfully",
        "record": record
    }

@router.post("/users/{user_id}/restore")
def restore_user(
    user_id: str,
    body: RestoreUserRequest,
    request: Request,
    admin: AuthenticatedUser = Depends(require_admin)
):
    """
    Restore a suspended user account with explicit audit logging.
    """
    restored = moderation_service.restore_user(
        user_id=user_id,
        admin_id=admin.id,
        reason=body.reason
    )

    client_ip = request.client.host if request.client else "unknown"
    audit_service.record(
        actor_id=admin.id,
        actor_role=admin.role,
        action="USER_RESTORED",
        target_type="user",
        target_id=user_id,
        result="SUCCESS" if restored else "NOT_FOUND",
        ip_address=client_ip,
        reason=body.reason
    )

    return {
        "status": "success",
        "message": f"User {user_id} restored",
        "was_suspended": restored
    }

@router.get("/moderation/reports", response_model=List[ModerationReport])
def list_moderation_reports(
    status_filter: Optional[str] = Query(default=None, alias="status"),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    moderator: AuthenticatedUser = Depends(require_moderator)
):
    """
    List reports for moderation triage.
    """
    return moderation_service.list_reports(status=status_filter, limit=limit, offset=offset)

@router.post("/moderation/reports/{report_id}/action")
def action_moderation_report(
    report_id: str,
    body: ReportActionRequest,
    request: Request,
    moderator: AuthenticatedUser = Depends(require_moderator)
):
    """
    Take moderation action on reported content or user.
    """
    report = moderation_service.action_report(
        report_id=report_id,
        moderator_id=moderator.id,
        action=body.action,
        reason=body.reason
    )
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    client_ip = request.client.host if request.client else "unknown"
    audit_service.record(
        actor_id=moderator.id,
        actor_role=moderator.role,
        action=f"REPORT_ACTION_{body.action.upper()}",
        target_type="report",
        target_id=report_id,
        result="SUCCESS",
        ip_address=client_ip,
        reason=body.reason,
        details={"action": body.action, "target_type": report.target_type, "target_id": report.target_id}
    )

    return {
        "status": "success",
        "message": f"Action '{body.action}' applied to report {report_id}",
        "report": report
    }

@router.get("/system/overview", response_model=SystemOverviewResponse)
def get_system_overview(admin: AuthenticatedUser = Depends(require_admin)):
    """
    High-level system health and security posture. Protected by Admin RBAC.
    """
    return SystemOverviewResponse(
        service="Truthprenuer Local Admin API",
        environment=settings.ENVIRONMENT,
        version=settings.VERSION,
        admin_ui_port=60135,
        admin_api_port=settings.ADMIN_PORT,
        total_audit_events=audit_service.count(),
        zero_trust_edge=True,
        fail_closed=True
    )
