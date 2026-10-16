# Truthprenuer Local-Only Admin System (`ADMIN/`)

## 1. Zero-Trust Security Directive
The Admin Console is strictly private and runs **exclusively on local loopback interface**:
- **URL:** `http://127.0.0.1:60135`
- **Network Interface:** `127.0.0.1` (Strict Loopback Only)
- **Port:** `60135` (Fail-fast with `strictPort: true`)
- **LAN Exposure:** ZERO (`0.0.0.0` forbidden; connection refused on LAN IP `10.x.x.x` / `192.168.x.x`)
- **Cloud/Public Internet Exposure:** ZERO (Never deployed to Cloudflare, Vercel, AWS S3, or any public domain)
- **Backend Origin Enforcement:** All `/api/v1/admin/*` endpoints strictly reject requests whose Origin or Host is not loopback `127.0.0.1:60135` / `localhost:60135` with HTTP 403 Forbidden.

## 2. Directory Mappings

| Directory | Purpose | Implementation Location |
| :--- | :--- | :--- |
| `ADMIN/FRONTEND/` | Vite + React + TypeScript Admin Console frontend | [`admin_panel/`](../ADMIN) |
| `ADMIN/RUN_LOCAL/` | Standalone local launcher script | [`ADMIN/RUN_LOCAL/start_admin_60135.sh`](../ADMIN/RUN_LOCAL/start_admin_60135.sh) |
| `ADMIN/BACKEND/` | Administrative routes, user suspension, moderation | [`backend/app/api/v1/admin.py`](../backend/app/api/v1/admin.py) |
| `ADMIN/SECURITY/` | Local origin validation & loopback enforcement dependency | [`backend/app/api/deps.py`](../backend/app/api/deps.py) |
| `ADMIN/AUDIT_LOGS/` | Immutable WORM audit trail integration | [`backend/app/core/audit.py`](../backend/app/services/audit_service.py) |
| `ADMIN/DOCUMENTATION/` | Admin security specs & startup runbooks | [`PRODUCT/SECURITY/ADMIN_ISOLATION.md`](../PRODUCT/SECURITY/ADMIN_ISOLATION.md) |
| `ADMIN/TESTS/` | Admin route security and isolation regression test | [`backend/tests/test_api_suite.py`](../backend/tests/test_api_suite.py) |

## 3. How to Start the Admin Panel
```bash
./ADMIN/RUN_LOCAL/start_admin_60135.sh
```
Console starts immediately and is accessible exclusively in the local browser at `http://127.0.0.1:60135`.
