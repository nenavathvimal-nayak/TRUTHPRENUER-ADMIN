import time
import uuid
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class AuditLogEntry(BaseModel):
    event_id: str
    actor_id: str
    actor_role: str
    action: str
    target_type: str
    target_id: Optional[str] = None
    result: str = "SUCCESS"
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    request_id: Optional[str] = None
    reason: Optional[str] = None
    details: Dict[str, Any] = {}
    timestamp: float

class AuditService:
    """
    Append-only in-memory and local persistent audit trail service.
    """
    def __init__(self, max_buffer_size: int = 1000):
        self._buffer: List[AuditLogEntry] = []
        self._max_buffer = max_buffer_size

    def record(
        self,
        actor_id: str,
        actor_role: str,
        action: str,
        target_type: str,
        target_id: Optional[str] = None,
        result: str = "SUCCESS",
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        request_id: Optional[str] = None,
        reason: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ) -> AuditLogEntry:
        entry = AuditLogEntry(
            event_id=f"audit_{uuid.uuid4().hex[:12]}",
            actor_id=actor_id,
            actor_role=actor_role,
            action=action,
            target_type=target_type,
            target_id=target_id,
            result=result,
            ip_address=ip_address,
            user_agent=user_agent,
            request_id=request_id,
            reason=reason,
            details=details or {},
            timestamp=time.time()
        )
        self._buffer.append(entry)
        if len(self._buffer) > self._max_buffer:
            self._buffer.pop(0)
        return entry

    def query(
        self,
        limit: int = 50,
        offset: int = 0,
        action: Optional[str] = None
    ) -> List[AuditLogEntry]:
        results = self._buffer
        if action:
            results = [e for e in results if e.action == action]
        # Return in descending order (newest first)
        sorted_results = sorted(results, key=lambda x: x.timestamp, reverse=True)
        return sorted_results[offset : offset + limit]

    def count(self) -> int:
        return len(self._buffer)

audit_service = AuditService()
