import pytest
import jwt
import time
from fastapi.testclient import TestClient
import sys
import os

# Add ADMIN/backend to sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.main import app
from app.core.config import settings

client = TestClient(app)

SECRET = settings.SUPABASE_JWT_SECRET

def create_test_jwt(role: str = "Admin", user_id: str = "admin_user_001", expired: bool = False, wrong_secret: bool = False) -> str:
    now = time.time()
    exp = now - 3600 if expired else now + 3600
    payload = {
        "sub": user_id,
        "email": f"{user_id}@truthprenuer.local",
        "app_metadata": {"role": role},
        "user_metadata": {"role": role},
        "iat": int(now),
        "exp": int(exp)
    }
    sign_key = "wrong-key-secret-that-does-not-match-at-all" if wrong_secret else SECRET
    return jwt.encode(payload, sign_key, algorithm="HS256")

# 1. Healthcheck Test
def test_admin_api_healthcheck():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["port"] == 60136
    assert data["interface"] == "127.0.0.1"

# 2. Loopback Edge & IP Enforcement Tests
def test_admin_api_blocks_external_forwarded_ip():
    admin_token = create_test_jwt(role="Admin")
    response = client.get(
        "/api/v1/admin/audit-logs",
        headers={
            "Authorization": f"Bearer {admin_token}",
            "X-Forwarded-For": "203.0.113.195, 127.0.0.1"
        }
    )
    assert response.status_code == 403
    assert "Forbidden" in response.json()["detail"]

# 3. Authentication Integrity Tests
def test_admin_api_missing_auth_header():
    response = client.get("/api/v1/admin/audit-logs")
    assert response.status_code == 401
    assert "Authorization header required" in response.json()["detail"]

def test_admin_api_malformed_auth_header():
    response = client.get(
        "/api/v1/admin/audit-logs",
        headers={"Authorization": "Basic dXNlcjpwYXNz"}
    )
    assert response.status_code == 401

def test_admin_api_forged_token_rejected():
    forged_token = create_test_jwt(role="Admin", wrong_secret=True)
    response = client.get(
        "/api/v1/admin/audit-logs",
        headers={"Authorization": f"Bearer {forged_token}"}
    )
    assert response.status_code == 401

def test_admin_api_expired_token_rejected():
    expired_token = create_test_jwt(role="Admin", expired=True)
    response = client.get(
        "/api/v1/admin/audit-logs",
        headers={"Authorization": f"Bearer {expired_token}"}
    )
    assert response.status_code == 401

# 4. RBAC Authorization Tests
def test_admin_api_non_admin_role_rejected():
    founder_token = create_test_jwt(role="Founder", user_id="founder_123")
    response = client.get(
        "/api/v1/admin/audit-logs",
        headers={"Authorization": f"Bearer {founder_token}"}
    )
    assert response.status_code == 403
    assert "Administrative privileges required" in response.json()["detail"]

def test_admin_api_authorized_admin_access():
    admin_token = create_test_jwt(role="Admin", user_id="admin_123")
    response = client.get(
        "/api/v1/admin/audit-logs",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)

# 5. Privileged Operations Tests
def test_admin_api_suspend_self_rejected():
    admin_token = create_test_jwt(role="Admin", user_id="admin_123")
    response = client.post(
        "/api/v1/admin/users/admin_123/suspend",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"reason": "Self-suspension attempt", "duration_days": 7}
    )
    assert response.status_code == 400
    assert "Cannot perform administrative suspension on your own session" in response.json()["detail"]

def test_admin_api_suspend_and_restore_user():
    admin_token = create_test_jwt(role="Admin", user_id="admin_123")
    target_user = "bad_actor_999"

    # Suspend target
    suspend_res = client.post(
        f"/api/v1/admin/users/{target_user}/suspend",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"reason": "Terms of service violation - spamming", "duration_days": 14}
    )
    assert suspend_res.status_code == 200
    assert suspend_res.json()["status"] == "success"

    # Restore target
    restore_res = client.post(
        f"/api/v1/admin/users/{target_user}/restore",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"reason": "Spam appeal approved by safety committee"}
    )
    assert restore_res.status_code == 200
    assert restore_res.json()["status"] == "success"

    # Check audit log contains both events
    logs_res = client.get(
        "/api/v1/admin/audit-logs?limit=10",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert logs_res.status_code == 200
    actions = [log["action"] for log in logs_res.json()]
    assert "USER_SUSPENDED" in actions
    assert "USER_RESTORED" in actions

# 6. System Overview Test
def test_admin_api_system_overview():
    admin_token = create_test_jwt(role="Super_Admin", user_id="super_admin_001")
    response = client.get(
        "/api/v1/admin/system/overview",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["admin_ui_port"] == 60135
    assert data["admin_api_port"] == 60136
    assert data["zero_trust_edge"] is True
    assert data["fail_closed"] is True
