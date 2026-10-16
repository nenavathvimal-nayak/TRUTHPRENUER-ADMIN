# Truthprenuer Local Admin Console Operations Manual (`ADMIN/DOCUMENTATION/ADMIN_OPERATIONS_MANUAL.md`)

## 1. Zero-Trust Security Architecture
The Truthprenuer Admin Console provides local management operations (user role elevation, consensus dispute override, RLS policy audit, and system telemetry).

To prevent unauthorized remote access, data exfiltration, and attacks from the public Internet:
- The Admin application binds strictly to loopback IP `127.0.0.1`.
- The port is locked to `60135` (`strictPort: true`).
- The web assets are NEVER deployed to Vercel, Firebase Hosting, Netlify, AWS S3, or any public CDN.
- The FastAPI backend validates that privileged admin requests originate from `http://127.0.0.1:60135`.

## 2. Launching the Admin Console
```bash
# Using the dedicated launcher script
./ADMIN/RUN_LOCAL/start_admin_60135.sh

# Or directly via npm in admin_panel
cd admin_panel && npm run dev
```

## 3. Verifying Local Isolation
Run the automated isolation audit:
```bash
./ADMIN/SCRIPTS/audit_admin_isolation.sh
```
LAN connections to `http://<your-lan-ip>:60135/` will receive `Connection Refused`.
