# Changelog — TRUTHPRENUER-ADMIN Workspace

All notable changes to the **`TRUTHPRENUER-ADMIN`** repository architecture and workspace integration will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-14

### Added
- **Git Submodule Integration:** Established `USERS/FLUTTER/taeed_flutter_source` as a cleanly integrated Git submodule tracking `https://github.com/nenavathvimal-nayak/Truthprenuer.git`.
- **Root Admin Launcher:** Created `DEVTOOLS/SCRIPTS/start_admin_60135.sh` delegating directly to the isolated loopback runner at `127.0.0.1:60135`.
- **Comprehensive Documentation Suite:**
  - `PRODUCT/REPOSITORY_MANAGEMENT/REPOSITORY_RELATIONSHIP.md` (Dual-repo architecture & ownership boundaries)
  - `PRODUCT/REPOSITORY_MANAGEMENT/CLONE_AND_SETUP.md` (Step-by-step developer onboarding & submodule initialization)
  - `PRODUCT/REPOSITORY_MANAGEMENT/COMMIT_AND_PUSH_WORKFLOW.md` (Guidelines for independent commits, submodule advancement, and synchronization)
  - `PRODUCT/REPOSITORY_MANAGEMENT/REPOSITORY_INVENTORY.md` (Telemetry, branch baselines, and commit SHAs)
  - `PRODUCT/QA_REPORTS/REPOSITORY_INTEGRATION_REPORT.md` (Quality assurance and security verification audit)
- **Root Configuration Files:**
  - `.gitmodules`: Submodule declaration pointing to `Truthprenuer.git`
  - `.gitignore`: Comprehensive ignore policy shielding secrets (`.env`), build directories, IDE files, and dependencies
  - `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`

### Changed
- Refactored submodule path from legacy unescaped path `USER'S  apps/taeed_flutter_source` to clean standard path `USERS/FLUTTER/taeed_flutter_source`.
- Synchronized child submodule commit to `fd51306` (Supabase OTP authentication & Admin security policies).
