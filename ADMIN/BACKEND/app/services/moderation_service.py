import time
import uuid
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class ModerationReport(BaseModel):
    id: str
    target_type: str
    target_id: str
    reporter_id: str
    reason: str
    status: str = "PENDING"
    created_at: float
    action_taken: Optional[str] = None
    moderator_id: Optional[str] = None
    action_reason: Optional[str] = None

class ModerationService:
    def __init__(self):
        self._suspended_users: Dict[str, Dict[str, Any]] = {}
        self._reports: List[ModerationReport] = []

    def suspend_user(
        self,
        user_id: str,
        admin_id: str,
        reason: str,
        duration_days: Optional[int] = None
    ) -> Dict[str, Any]:
        record = {
            "user_id": user_id,
            "admin_id": admin_id,
            "reason": reason,
            "duration_days": duration_days,
            "suspended_at": time.time(),
            "is_active": True
        }
        self._suspended_users[user_id] = record
        return record

    def restore_user(self, user_id: str, admin_id: str, reason: str) -> bool:
        if user_id in self._suspended_users:
            del self._suspended_users[user_id]
            return True
        return False

    def is_suspended(self, user_id: str) -> bool:
        return user_id in self._suspended_users

    def add_report(self, target_type: str, target_id: str, reporter_id: str, reason: str) -> ModerationReport:
        report = ModerationReport(
            id=f"rep_{uuid.uuid4().hex[:8]}",
            target_type=target_type,
            target_id=target_id,
            reporter_id=reporter_id,
            reason=reason,
            status="PENDING",
            created_at=time.time()
        )
        self._reports.append(report)
        return report

    def list_reports(
        self,
        status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[ModerationReport]:
        results = self._reports
        if status:
            results = [r for r in results if r.status.upper() == status.upper()]
        return results[offset : offset + limit]

    def action_report(
        self,
        report_id: str,
        moderator_id: str,
        action: str,
        reason: str
    ) -> Optional[ModerationReport]:
        for report in self._reports:
            if report.id == report_id:
                report.status = "RESOLVED"
                report.action_taken = action
                report.moderator_id = moderator_id
                report.action_reason = reason
                return report
        return None

moderation_service = ModerationService()
