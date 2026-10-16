# Truthprenuer Admin Authentication (`ADMIN/AUTH/`)

## 1. Overview
Authentication mechanisms for the private Admin Console.

## 2. Authentication Paths
1. **Local Development 1-Click Bypass:** Active exclusively in `import.meta.env.DEV` mode. Allows instant sign-in as `Super_Admin` without credentials.
2. **Authoritative Supabase Authentication:** Sign in using email & password verified via Supabase Auth API (`admin_panel/src/lib/supabase.ts`).
3. **Guard Implementation:** [`admin_panel/src/components/AdminAuthGuard.tsx`](../../ADMIN/src/components/AdminAuthGuard.tsx).
