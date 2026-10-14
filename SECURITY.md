# Security Policy & Admin Isolation Standards

## 1. Supported Versions

| Project Component | Version Track | Supported |
|---|---|---|
| TRUTHPRENUER-ADMIN | Main Workspace | :white_check_mark: |
| taeed_flutter_source (Flutter) | 3.29.x / Main | :white_check_mark: |
| Admin Console (React/Vite) | 19.x / 8.x | :white_check_mark: |
| FastAPI Gateway Backend | Python 3.11 | :white_check_mark: |

---

## 2. Admin Console Security Architecture

The Truthprenuer Admin Console provides administrative oversight, moderation, user management, and audit log inspection. To ensure zero exposure to internet threats:

1. **Strict Loopback Binding:**
   - The Admin console server binds exclusively to `127.0.0.1:60135`.
   - Binding to all interfaces (`0.0.0.0`) or local area networks (`LAN`) is strictly prohibited.
2. **Fail-Fast Port Enforcement:**
   - The startup script aborts immediately if port `60135` is occupied by another process to prevent port collisions or fallback to insecure ports.
3. **No Public Deployment:**
   - The Admin application is an internal operator tool. It is never deployed to Cloudflare Pages, Vercel, Netlify, or public container registries.
4. **Credential Isolation:**
   - Privileged administrative keys (e.g., Supabase service role keys) must never be bundled into browser client code or the public consumer Flutter application.

---

## 3. Reporting a Vulnerability

If you discover a potential security vulnerability within this repository or the Truthprenuer ecosystem:

1. **Do NOT open a public GitHub issue.**
2. Send an encrypted email with proof-of-concept details to: `security@truthprenuer.com` (or direct message to repository administrators).
3. Include:
   - Specific component and file paths involved
   - Step-by-step reproduction instructions
   - Potential impact assessment
4. The security response team will acknowledge receipt within 24 hours and issue remediation updates promptly.
