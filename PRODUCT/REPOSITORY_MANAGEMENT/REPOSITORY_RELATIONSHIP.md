# Repository Relationship & Architectural Model

## 1. Executive Summary & Purpose

This document formally specifies the dual-repository relationship between the parent orchestrator repository **`TRUTHPRENUER-ADMIN`** and the nested independent repository **`taeed_flutter_source`**.

| Aspect | Repository A: `TRUTHPRENUER-ADMIN` | Repository B: `taeed_flutter_source` |
|---|---|---|
| **Role** | Main Workspace Orchestrator & Admin Console Hub | Independent Flutter Core, Universal Clients, Backend & DB |
| **GitHub Remote** | `https://github.com/nenavathvimal-nayak/TRUTHPRENUER-ADMIN.git` | `https://github.com/nenavathvimal-nayak/Truthprenuer.git` |
| **Default Branch** | `main` | `main` |
| **Nesting Model** | Parent Container | Git Submodule (`USERS/FLUTTER/taeed_flutter_source`) |
| **Preservation** | Dedicated repository identity and full commit history | Dedicated repository identity and full commit history |

---

## 2. Why Two Repositories Exist

1. **Separation of Architectural Concerns:**
   - **`TRUTHPRENUER-ADMIN`** serves as the primary workspace for system administrators, DevOps, integration testing, shared product specifications, and workspace-level automation.
   - **`taeed_flutter_source`** is an established, independent Flutter code base and client ecosystem supporting multi-platform builds (iOS, Android, Web, macOS, Linux, Windows), Python backend microservices, and database schemas.

2. **Security & Access Isolation:**
   - The Admin console is strictly a localhost-bound utility (`127.0.0.1:60135`) with zero public ingress.
   - Public user-facing clients (Flutter web/mobile) follow separate CI/CD deployment channels (e.g., Cloudflare Pages, Apple App Store, Google Play Store).
   - Keeping the administrative orchestrator distinct ensures admin privileges, audit-log monitors, and elevated operations are never compiled into consumer mobile application bundles.

3. **Autonomous Lifecycle & CI/CD Pipelines:**
   - Flutter and mobile release cycles require dedicated platform tooling (Fastlane, Xcode, Gradle, CocoaPods).
   - Administrative and infrastructure releases require container checks, schema migrations, and security auditing.

---

## 3. Selected Nested-Repository Model: Git Submodule

### Selected Model: Option A — Git Submodule (Path: `USERS/FLUTTER/taeed_flutter_source`)

Following an architectural review of Options A (Submodule), B (Subtree), and C (Ordinary Nested Git Repository):
- **Option A (Submodule)** was selected because it preserves the 100% independent Git history and identity of both repositories without squashing, rewriting commits, or duplicating files.
- The parent repository records a cryptographic gitlink (mode `160000`) pointing to a specific commit SHA of `taeed_flutter_source`, tracked in `.gitmodules`.

### Submodule Configuration in `.gitmodules`
```ini
[submodule "USERS/FLUTTER/taeed_flutter_source"]
	path = USERS/FLUTTER/taeed_flutter_source
	url = https://github.com/nenavathvimal-nayak/Truthprenuer.git
```

---

## 4. File Ownership & Responsibility Matrix

| Asset Category | Specific Path | Authoritative Repository Owner |
|---|---|---|
| Workspace Orchestration & Config | `TRUTHPRENUER-ADMIN/` root | `TRUTHPRENUER-ADMIN` |
| Root Ignore & Modules | `.gitignore`, `.gitmodules` | `TRUTHPRENUER-ADMIN` |
| Master Workspace Documentation | `PRODUCT/REPOSITORY_MANAGEMENT/`, `PRODUCT/QA_REPORTS/` | `TRUTHPRENUER-ADMIN` |
| Workspace Launcher Scripts | `DEVTOOLS/SCRIPTS/` | `TRUTHPRENUER-ADMIN` |
| Submodule Gitlink Pointer | `USERS/FLUTTER/taeed_flutter_source` (`mode 160000`) | `TRUTHPRENUER-ADMIN` |
| Flutter Mobile & Web Client Code | `USERS/FLUTTER/taeed_flutter_source/USERS/` | `taeed_flutter_source` |
| Flutter Dependency Manifests | `USERS/FLUTTER/taeed_flutter_source/USERS/pubspec.yaml`, `pubspec.lock` | `taeed_flutter_source` |
| Admin Web Application (React/Vite) | `USERS/FLUTTER/taeed_flutter_source/ADMIN/` | `taeed_flutter_source` |
| FastAPI Gateway Backend | `USERS/FLUTTER/taeed_flutter_source/backend/` | `taeed_flutter_source` |
| Supabase Database Schemas & Policies | `USERS/FLUTTER/taeed_flutter_source/DATABASE/` | `taeed_flutter_source` |
| Algorithm Engines & Tests | `USERS/FLUTTER/taeed_flutter_source/ALGORITHMS/` | `taeed_flutter_source` |
| Core Product Specs & Design Tokens | `USERS/FLUTTER/taeed_flutter_source/PRODUCT/` | `taeed_flutter_source` |
| Platform Builds (`android/`, `ios/`, etc.) | `USERS/FLUTTER/taeed_flutter_source/USERS/{android,ios,macos,...}` | `taeed_flutter_source` |

---

## 5. Synchronization & Change Propagation Rules

1. **Rule of Independent Modification:**
   - Any modifications to files within `USERS/FLUTTER/taeed_flutter_source/` must be staged, committed, and pushed **inside the submodule directory** to `origin` (`Truthprenuer.git`).
2. **Rule of Submodule Pointer Updating:**
   - Once a new commit exists in `taeed_flutter_source`, the parent repository will observe a modified gitlink.
   - The parent repository must commit the updated submodule commit pointer and push to `origin` (`TRUTHPRENUER-ADMIN.git`).
3. **Rule of No Silent Cross-Over:**
   - Never run `git add .` in the parent repository expecting it to stage uncommitted files inside the submodule. Git submodules explicitly shield internal files from parent staging.
