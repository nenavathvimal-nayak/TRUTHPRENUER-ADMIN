# TRUTHPRENUER ADMIN — ISOLATION SPECIFICATION & DEFENSE MATRIX

## 1. Network Boundary Invariants

1. **Host Binding:** `127.0.0.1` (IPv4 Loopback Interface)
2. **Port Number:** `60135` (Strict port; fails fast if occupied)
3. **LAN Protection:** Connection refused from any LAN interface (`10.x.x.x`, `192.168.x.x`, etc.)
4. **Cloud Prohibition:** Admin assets are never built into the user web deployment bundle.
5. **Gateway IP Guard:** Backend `/api/v1/admin/*` enforces `require_local_admin_origin`, rejecting non-loopback IPs with HTTP 403 Forbidden.

---

## 2. Authentication & Authorization Invariants

1. **Server-Side Role Validation:** Session tokens are checked against the authoritative `profiles` PostgreSQL table.
2. **Allowed Administrative Roles:** `Admin`, `Super_Admin`, `Security`.
3. **Suspension Check:** `is_suspended` must be false.
4. **WORM Audit Trail:** All administrative operations are logged append-only to `admin_audit_logs`.
