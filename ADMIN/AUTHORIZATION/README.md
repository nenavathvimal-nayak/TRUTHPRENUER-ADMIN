# Truthprenuer Admin Role-Based Access Control (`ADMIN/AUTHORIZATION/`)

## 1. Privileged Roles
- **Super_Admin:** Full system privileges (user suspension, role alteration, audit inspection).
- **Admin:** Operational administration and moderation dispute resolution.
- **Security:** Security audit log inspection and IP blocklist review.
- **Moderator:** Content-level review (warn user, dismiss report, remove spam).

## 2. Server-Side Enforcement
- Enforced on all backend routes via [`backend/app/api/deps.py`](../../backend/app/api/deps.py) (`require_role`).
- Any attempt to access `/api/v1/admin/*` by non-admin roles results in HTTP 403 Forbidden.
- External non-loopback IPs attempting admin routes receive HTTP 403 Forbidden (`require_local_admin_origin`).
