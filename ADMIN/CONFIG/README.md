# Truthprenuer Admin Configuration (`ADMIN/CONFIG/`)

## 1. Local Network Constraints
- Host: `127.0.0.1` (Strict loopback, zero LAN exposure)
- Port: `60135` (`strictPort: true` to prevent automatic fallback)
- Environment Variables: Loaded via `admin_panel/.env` or Vite build-time environment constants.
- Production Bundles: Never exposed to external CDN or public web hosting.
