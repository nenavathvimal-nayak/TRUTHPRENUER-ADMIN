# Truthprenuer Administrative Services (`ADMIN/SERVICES/`)

## 1. Overview
Backend operational services handling privileged administrative actions.

## 2. Implementations
- **Moderation Service:** [`backend/app/services/moderation_service.py`](../../backend/app/services/moderation_service.py) handles user suspensions, warnings, and content dismissals.
- **Audit Service:** [`backend/app/services/audit_service.py`](../../backend/app/services/audit_service.py) records immutable append-only WORM logs to Supabase table `admin_audit_logs`.
