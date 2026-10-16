# TRUTHPRENUER — REPOSITORY OWNERSHIP MIGRATION PLAN

**Plan Version:** 1.0.0  
**Date:** October 16, 2026  
**Authors:** Principal Architect, GitHub Maintainer, Application Security Engineer, Senior Full-Stack Engineer  
**Status:** PROPOSED & READY FOR BATCH-BY-BATCH EXECUTION  

---

## 1. Executive Migration Framework

### 1.1 Target Architecture & Separation of Concerns

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        WORKSPACE ORCHESTRATION                         │
│                    TRUTHPRENUER-ADMIN (Parent Hub)                     │
│                                                                        │
│   ├── ADMIN/                     <-- React 19 / Vite 8 (127.0.0.1:60135)│
│   │   ├── src/ & components/                                           │
│   │   ├── backend/               <-- Local Admin API (127.0.0.1:60136) │
│   │   └── package.json                                                 │
│   ├── DEVTOOLS/SCRIPTS/          <-- Local launchers & validators       │
│   └── PRODUCT/REPOSITORY_MGMT/   <-- Multi-repo governance & reports   │
└────────────────────────────────────────────────────────────────────────┘
          │ (Submodule: USERS/FLUTTER/taeed_flutter_source)
          ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       USER-FACING APPLICATIONS       │  │      SHARED PLATFORM CORE    │
│       Truthprenuer (Client App)      │  │    TRUTHPRENUER-PLATFORM     │
│                                      │  │                              │
│  ├── USERS/ (Flutter 3.29 Client)    │  │  ├── backend/ (Public APIs)  │
│  │   ├── lib/ (Dart source)          │  │  ├── DATABASE/ (PostgreSQL)  │
│  │   ├── test/ (64 unit tests)       │  │  ├── ALGORITHMS/ (Scoring)   │
│  │   ├── pubspec.yaml & lock         │  │  └── INFRASTRUCTURE/ (Docker)│
│  │   └── web, android, ios, desktop  │  └──────────────────────────────┘
│  └── Client documentation & assets   │                 ▲
└──────────────────────────────────────┘                 │
                    │                                    │
                    └────────── Consumes via HTTP ───────┘
```

---

## 2. File-by-File & Directory Migration Mapping

| Current Path & Owning Repo | Proposed Destination | Architectural Rationale | Dependencies & Imports Affected | Build, Test & CI Paths Affected | Git History Strategy | Validation Command | Rollback Procedure |
|---|---|---|---|---|---|---|---|
| `taeed_flutter_source/ADMIN/` (56 files) | `TRUTHPRENUER-ADMIN/ADMIN/` | Rule 1: Admin Panel UI belongs exclusively in parent orchestrator | Internal React imports (`src/components/`, `src/pages/`, `src/lib/`) remain relative | `ADMIN/vite.config.ts`, `npm run build`, `npm run dev` | Copy tree with metadata; staged commit in parent | `cd ADMIN && npm install && npm run build` | `rm -rf ADMIN/` in parent |
| `taeed_flutter_source/admin_panel` (symlink) | Removed from child | Rule 3: Admin UI must not remain in user-app repo | None (it was an alias for `ADMIN/`) | None | Git `rm admin_panel` | `git status` in child | `git checkout HEAD -- admin_panel` |
| `taeed_flutter_source/ADMIN/RUN_LOCAL/start_admin_60135.sh` | `TRUTHPRENUER-ADMIN/ADMIN/RUN_LOCAL/start_admin_60135.sh` and root `DEVTOOLS/SCRIPTS/start_admin_60135.sh` | Rule 1: Local launch scripts belong in parent | Relative path to `ADMIN` folder updated to `./ADMIN` | Executable permissions (`chmod +x`) | Commit in parent | `./DEVTOOLS/SCRIPTS/start_admin_60135.sh --check-only` | `git checkout HEAD -- DEVTOOLS/` |
| `taeed_flutter_source/ADMIN/TESTS/test_loopback_isolation.py` | `TRUTHPRENUER-ADMIN/ADMIN/TESTS/test_loopback_isolation.py` | Rule 1: Admin-specific tests belong in parent | Points to local Admin URL (`127.0.0.1:60135`) | Pytest target in parent | Commit in parent | `pytest ADMIN/TESTS/` | `git checkout HEAD -- ADMIN/TESTS/` |
| Privileged API routes in `backend/app/api/v1/admin.py` | `TRUTHPRENUER-ADMIN/ADMIN/backend/` | Rule 7: Local-only privileged Admin API on loopback port `60136` | Imports `audit_service`, `moderation_service`, `deps.py` | Runs on loopback `127.0.0.1:60136`; isolated from public API | Independent service module in parent | `curl http://127.0.0.1:60136/health` | Discard parent `ADMIN/backend/` |
| `taeed_flutter_source/USERS/` (272 files) | Remains in `Truthprenuer/USERS/` | Rule 2: User-facing Flutter apps belong in `Truthprenuer` | Zero changes needed; completely self-contained | `flutter test --no-pub`, `flutter build web` | Preserved in child history | `cd USERS && flutter test --no-pub` | `git checkout HEAD -- USERS/` |
| `taeed_flutter_source/backend/` (Public API) | `TRUTHPRENUER-PLATFORM/backend/` | Rule 4: Shared backend belongs in `TRUTHPRENUER-PLATFORM` | Public routes `/api/v1/pitches`, `/api/v1/reviews`, etc. | `pytest backend/tests/` (public suite) | Export branch or subtree to new repo | `backend/venv/bin/pytest backend/tests/` | Restore from child commit `fd51306` |
| `taeed_flutter_source/DATABASE/` (14 files) | `TRUTHPRENUER-PLATFORM/DATABASE/` | Rule 4: Relational database assets belong in `TRUTHPRENUER-PLATFORM` | Schema, migrations, RLS policies, functions | `DATABASE/TESTS/` | Preserved in platform repo | Verify SQL syntax with linter | Restore from child commit `fd51306` |
| `taeed_flutter_source/ALGORITHMS/` (20 files) | `TRUTHPRENUER-PLATFORM/ALGORITHMS/` | Rule 4: Proprietary server-side algorithms belong in platform | Python scoring and search models | `pytest ALGORITHMS/TESTS/` (4 passed) | Preserved in platform repo | `pytest ALGORITHMS/TESTS/` | Restore from child commit `fd51306` |
| `taeed_flutter_source/INFRASTRUCTURE/` (14 files) | `TRUTHPRENUER-PLATFORM/INFRASTRUCTURE/` | Rule 4: Platform infrastructure belongs in platform | Docker, Fly.io, Compose configs | CI/CD container builds | Preserved in platform repo | `docker compose config` | Restore from child commit `fd51306` |
| Parent orchestration & validation scripts | `TRUTHPRENUER-ADMIN/DEVTOOLS/SCRIPTS/` | Rule 5: Parent owns workspace orchestration & verification | Updated to check extracted `ADMIN/` in parent | `validate_workspace.sh` | Tracked in parent | `./DEVTOOLS/SCRIPTS/validate_workspace.sh` | Discard parent working tree |

---

## 3. Step-by-Step Execution Sequence

The migration must proceed in controlled, non-destructive batches:

### Batch 1: Admin Extraction into `TRUTHPRENUER-ADMIN/ADMIN/`
1. Copy `taeed_flutter_source/ADMIN/` into `TRUTHPRENUER-ADMIN/ADMIN/` preserving file structure, permissions, and package manifests.
2. Ensure `TRUTHPRENUER-ADMIN/ADMIN/vite.config.ts` enforces `host: '127.0.0.1'`, `port: 60135`, and `strictPort: true`.
3. Create local launcher `TRUTHPRENUER-ADMIN/DEVTOOLS/SCRIPTS/start_admin_60135.sh` pointing directly to `TRUTHPRENUER-ADMIN/ADMIN`.
4. Install dependencies in `TRUTHPRENUER-ADMIN/ADMIN/` and execute `npm run build` to verify clean build.
5. Execute Admin isolation check and unit tests.

### Batch 2: Privileged Local Admin API Implementation
1. Create dedicated local-only Admin API service in `TRUTHPRENUER-ADMIN/ADMIN/backend/`.
2. Configure to bind strictly to `127.0.0.1:60136` (IPv4 loopback).
3. Include privileged endpoints: audit logs, user suspension/restoration, content moderation, system health.
4. Enforce server-side authentication (cryptographic signature verification), authoritative role enforcement, and audit logging.
5. Create local API launcher `TRUTHPRENUER-ADMIN/DEVTOOLS/SCRIPTS/start_admin_api_60136.sh`.
6. Verify local request paths work and reject any non-loopback connections.

### Batch 3: User Application Repository Verification & Admin Cleanup
1. Verify that `USERS/` (Flutter client) builds and tests pass independently without depending on `ADMIN/`.
2. Remove `ADMIN/` and `admin_panel` from `Truthprenuer`.
3. Verify `flutter test --no-pub` passes 64/64 tests.
4. Verify Flutter web build (`flutter build web`) succeeds without any Admin code included.

### Batch 4: TRUTHPRENUER-PLATFORM Preparation & Staging
1. Prepare local staging directory for `TRUTHPRENUER-PLATFORM`.
2. Copy `backend/`, `DATABASE/`, `ALGORITHMS/`, and `INFRASTRUCTURE/` into the platform staging workspace.
3. Remove local-only `/api/v1/admin/*` endpoints from the public backend so that the public API does NOT expose Admin routes.
4. Verify that public backend tests and algorithm tests pass in the platform environment.

### Batch 5: Submodule & Cross-Repository Governance
1. Update `DEVTOOLS/SCRIPTS/validate_workspace.sh` in the parent repository to validate:
   - `ADMIN/` exists and builds in parent.
   - Admin UI is absent from child.
   - Flutter client builds and passes 64 tests in child.
   - Admin host/port is `127.0.0.1:60135` and Admin API is `127.0.0.1:60136`.
2. Update repository relationship documentation and commit checklists.
3. Run complete verification suite.

---

## 4. Rollback and Disaster Recovery

If any failure occurs during extraction:
- **Parent Rollback:** `rm -rf ADMIN/` in `TRUTHPRENUER-ADMIN` restores parent to prior clean state.
- **Child Rollback:** `git checkout HEAD -- ADMIN/ admin_panel` restores child to prior clean state.
- **Submodule Rollback:** `git submodule update --init --recursive --force` resynchronizes child submodule to commit `fd51306`.
- **Zero Loss Guarantee:** No Git commit or push is made until all batches are verified.
