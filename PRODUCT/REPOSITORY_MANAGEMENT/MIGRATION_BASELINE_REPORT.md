# TRUTHPRENUER — REPOSITORY OWNERSHIP MIGRATION BASELINE REPORT

**Document ID:** POM-BASE-001  
**Audit Date:** October 16, 2026  
**Auditor Roles:** Principal Architect, GitHub Maintainer, Application Security Engineer, Senior Full-Stack Engineer  
**Classification:** Authoritative Migration Telemetry & Baseline Inventory  

---

## 1. Executive Summary & Repository Identities

This baseline report records the verified physical structure, commit history, dependencies, configurations, tests, and security boundaries across the Truthprenuer dual-repository workspace prior to executing the repository ownership migration.

### 1.1 Repositories Audited

| Attribute | Parent Repository (`TRUTHPRENUER-ADMIN`) | Child Submodule (`taeed_flutter_source`) | Target Third Repository (`TRUTHPRENUER-PLATFORM`) |
|---|---|---|---|
| **Role** | Main Workspace Orchestrator & Admin Console Hub | Current Monorepo Source (User Apps, Admin, Backend, DB) | Planned Shared Backend, Database, Algorithms & Infrastructure |
| **GitHub Remote** | `https://github.com/nenavathvimal-nayak/TRUTHPRENUER-ADMIN.git` | `https://github.com/nenavathvimal-nayak/Truthprenuer.git` | `https://github.com/nenavathvimal-nayak/TRUTHPRENUER-PLATFORM.git` |
| **Local Path** | `/Volumes/NAYAK/TRUTHRENUER ADM/TRUTHPRENUER-ADMIN` | `USERS/FLUTTER/taeed_flutter_source` | Local staging path to be initialized |
| **Current Branch** | `main` | `main` | `main` (upon initialization) |
| **Baseline Commit SHA** | `20e75a8` | `fd51306` | Initial baseline commit upon creation |
| **Submodule Mapping** | Container for `USERS/FLUTTER/taeed_flutter_source` | Submodule registered at parent gitlink `fd51306` | Will be registered as submodule or peer orchestrator |

### 1.2 Non-Negotiable Ownership Boundary Rules
1. **`TRUTHPRENUER-ADMIN`**: Sole source of truth for Admin Panel UI, Admin frontend, Admin-specific tests, local launch scripts, Admin documentation, and the local-only privileged Admin API.
2. **`Truthprenuer`**: User-facing applications only (Web, Android, iOS, Desktop, shared client code, app assets, client tests). Zero Admin UI code post-migration.
3. **`TRUTHPRENUER-PLATFORM`**: Shared backend, database, server-side algorithms, and platform infrastructure. Must not be placed inside the user application directory.
4. **Admin UI Isolation**: Bound strictly to `127.0.0.1:60135`. Zero public hosting, wildcard binding (`0.0.0.0`), public DNS, or tunnels.
5. **Admin Privileged API Isolation**: Local-only on a separate loopback port (`127.0.0.1:60136`), with privileged service credentials kept server-side and never in browser code.

---

## 2. Working Tree & Commit Telemetry

### 2.1 Parent Repository (`TRUTHPRENUER-ADMIN`)
- **Git Root:** `/Volumes/NAYAK/TRUTHRENUER ADM/TRUTHPRENUER-ADMIN`
- **HEAD Commit:** `20e75a8` (`docs: establish dual-repo management architecture, onboarding guides, and launcher scripts`)
- **Remote Origin:** `https://github.com/nenavathvimal-nayak/TRUTHPRENUER-ADMIN.git`
- **Submodule Pointer:** `USERS/FLUTTER/taeed_flutter_source` -> commit `fd5130679893f8dd40888996f539109fbf7650fc`
- **Tracked Files Count:** 13 files
- **Uncommitted Modifications:**
  - `CONTRIBUTING.md` (docs link sanitization)
  - `PRODUCT/QA_REPORTS/REPOSITORY_INTEGRATION_REPORT.md` (QA report updates)
  - `PRODUCT/REPOSITORY_MANAGEMENT/CLONE_AND_SETUP.md` (docs link sanitization)
  - `PRODUCT/REPOSITORY_MANAGEMENT/COMMIT_AND_PUSH_WORKFLOW.md` (docs link sanitization)
  - `PRODUCT/REPOSITORY_MANAGEMENT/REPOSITORY_INVENTORY.md` (telemetry update)
  - `README.md` (link sanitization)
- **Untracked Additions:**
  - `.github/workflows/workspace_ci.yml` (Parent CI validation workflow)
  - `DEVTOOLS/SCRIPTS/validate_workspace.sh` (Cross-repo integration validator)

### 2.2 Child Repository (`Truthprenuer` / `taeed_flutter_source`)
- **Git Root:** `/Volumes/NAYAK/TRUTHRENUER ADM/TRUTHPRENUER-ADMIN/USERS/FLUTTER/taeed_flutter_source`
- **HEAD Commit:** `fd51306` (`feat: implement Supabase OTP authentication, admin guards, and security policies`)
- **Remote Origin:** `https://github.com/nenavathvimal-nayak/Truthprenuer.git`
- **Tracked Files Count:** 645 files
- **Tracked Breakdown by Subsystem:**
  - `ADMIN/`: 55 files (React 19 / Vite 8 Admin Panel)
  - `USERS/`: 272 files (Flutter universal multi-platform client)
  - `backend/`: 34 files (FastAPI gateway & security services)
  - `DATABASE/`: 14 files (PostgreSQL schemas, migrations, RLS, functions)
  - `ALGORITHMS/`: 20 files (Scoring, recommendations, search, tests)
  - `INFRASTRUCTURE/`: 14 files (Docker, local development, CI/CD)
  - `PRODUCT/`: 135 files (Architecture, runbooks, specifications, PRDs)
  - `DEVTOOLS/`: 12 files (Generators, scripts, security scanning)
  - `.agents`: 73 files (Agent configuration and customizations)
  - `.github`: 3 files (Workflows)
  - Root manifests & docs: 13 files (`pubspec`, `README.md`, `admin_panel` symlink, etc.)

---

## 3. Subsystem Dependency & Runtime Analysis

### 3.1 Subsystem 1: Admin Application (`ADMIN/`)
- **Current Location:** `Truthprenuer/ADMIN/` (with `Truthprenuer/admin_panel` symlink)
- **Framework & Tooling:** React 19.0.0, Vite 8.0.0-beta.15, TailwindCSS 3.4.17, TypeScript 5.7.2
- **Manifests:** `package.json`, `package-lock.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `.oxlintrc.json`
- **Environment:** `ADMIN/.env.example` defines `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_BACKEND_URL`
- **Network & Host Binding:**
  - `vite.config.ts`: `server.host = '127.0.0.1'`, `server.port = 60135`, `server.strictPort = true`
  - `package.json`: `"dev": "vite --host 127.0.0.1 --port 60135"`
- **Backend Calls:**
  - Directly queries Supabase client via anon key for dashboard telemetry, user lists, and moderation reports.
  - Queries `/api/v1/admin/audit-logs` via `VITE_BACKEND_URL`.
- **Target Ownership:** **`TRUTHPRENUER-ADMIN/ADMIN/`**

### 3.2 Subsystem 2: User-Facing Applications (`USERS/`)
- **Current Location:** `Truthprenuer/USERS/`
- **Framework & Tooling:** Flutter 3.29.0, Dart SDK `>=3.3.0 <4.0.0`, Riverpod 2.5.1, GoRouter 14.0.1, Supabase Flutter 2.17.2
- **Manifests:** `USERS/pubspec.yaml`, `USERS/pubspec.lock`
- **Target Platforms:**
  - Web: `USERS/web/`
  - Android: `USERS/android/`
  - iOS: `USERS/ios/`
  - Desktop: `USERS/macos/`, `USERS/linux/`, `USERS/windows/`
- **Internal Cross-Dependencies:**
  - Completely self-contained inside `USERS/`. Does not import any React or Python code.
  - Contains in-app mobile views (`USERS/lib/views/`), models, repositories, and Riverpod providers.
- **Target Ownership:** **`Truthprenuer` (User App Repository)**

### 3.3 Subsystem 3: Shared Backend (`backend/`)
- **Current Location:** `Truthprenuer/backend/`
- **Framework & Tooling:** Python 3.11, FastAPI 0.115.6, Uvicorn 0.34.0, PyJWT 2.10.1, Supabase 2.11.0, Pytest 8.3.4, Pydantic 2.10.4
- **Manifests:** `requirements.txt`, `pyproject.toml` (if present), `Dockerfile`, `fly.toml`
- **Virtual Environment:** `backend/venv/` (Python 3.11.16)
- **API Surface:**
  - Public User APIs: `/api/v1/auth/*`, `/api/v1/pitches/*`, `/api/v1/reviews/*`, `/api/v1/investments/*`
  - Privileged APIs (currently co-located): `/api/v1/admin/*`
- **Target Ownership:**
  - Public user APIs -> **`TRUTHPRENUER-PLATFORM/backend/`**
  - Privileged admin APIs -> Extracted to dedicated local-only service **`TRUTHPRENUER-ADMIN/ADMIN/backend/`** (port `60136`)

### 3.4 Subsystem 4: Relational Database & Policies (`DATABASE/`)
- **Current Location:** `Truthprenuer/DATABASE/`
- **Engine:** PostgreSQL / Supabase
- **Assets:**
  - `DATABASE/SCHEMA/schema.sql`: Full schema with tables, sequences, foreign keys
  - `DATABASE/MIGRATIONS/`: Versioned migration scripts (001, 002, 003, 004, 005)
  - `DATABASE/POLICIES/rls_policies.sql`: Row-Level Security rules
  - `DATABASE/FUNCTIONS/`: Stored procedures
  - `DATABASE/TRIGGERS/`: Profile initialization and score update triggers
  - `DATABASE/SEEDS/`: Test seed fixtures
- **Target Ownership:** **`TRUTHPRENUER-PLATFORM/DATABASE/`**

### 3.5 Subsystem 5: Domain Algorithms (`ALGORITHMS/`)
- **Current Location:** `Truthprenuer/ALGORITHMS/`
- **Components:**
  - `ALGORITHMS/SCORING/`: Reputation weighting and founder credibility algorithms
  - `ALGORITHMS/RECOMMENDATIONS/`: Matching engine
  - `ALGORITHMS/ANALYTICS/`: Analytics computation
  - `ALGORITHMS/SEARCH/`: Semantic and vector search logic
  - `ALGORITHMS/TESTS/`: Test suite (4 tests passing)
- **Target Ownership:** **`TRUTHPRENUER-PLATFORM/ALGORITHMS/`**

### 3.6 Subsystem 6: Platform Infrastructure (`INFRASTRUCTURE/`)
- **Current Location:** `Truthprenuer/INFRASTRUCTURE/`
- **Components:**
  - `INFRASTRUCTURE/DOCKER/`: Containerfiles and Docker Compose files
  - `INFRASTRUCTURE/LOCAL_DEVELOPMENT/`: Local service orchestration
  - `INFRASTRUCTURE/CI_CD/`: GitHub Actions and pipeline templates
- **Target Ownership:** **`TRUTHPRENUER-PLATFORM/INFRASTRUCTURE/`**

---

## 4. Empirical Test Baseline

| Test Suite | Execution Command | Result | Duration |
|---|---|---|---|
| **Flutter Universal Client** | `cd USERS && flutter test --no-pub` | **64 passed (100%)** | 15.2s |
| **FastAPI Backend Suite** | `backend/venv/bin/pytest backend/tests/` | **17 passed (100%)** | 0.54s |
| **Algorithmic Engine Suite** | `backend/venv/bin/pytest ALGORITHMS/TESTS/` | **4 passed (100%)** | 0.08s |
| **Admin React/Vite Build** | `npm run build` (in `ADMIN/`) | **Clean build (dist/ created)** | 534ms |
| **Workspace Integration Validator** | `./DEVTOOLS/SCRIPTS/validate_workspace.sh` | **22/22 checks passed** | 24.1s |

---

## 5. Summary of Baseline Risks & Migration Prerequisites

1. **Extraction Order Prerequisite:** Admin files must NOT be deleted from `Truthprenuer` until `TRUTHPRENUER-ADMIN/ADMIN/` is fully extracted, dependencies installed, built cleanly, and local loopback verified.
2. **Platform Repository Prerequisite:** The user must approve the migration plan for `TRUTHPRENUER-PLATFORM` before files are extracted.
3. **No History Rewrites:** All migration steps must use Git-native file tracking and reviewed commits, avoiding destructive force-pushes or history squashing.
