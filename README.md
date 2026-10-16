# TRUTHPRENUER-ADMIN — Workspace Orchestrator & Admin Console Hub

Welcome to the **Truthprenuer Admin & Workspace Orchestration Repository**. This repository is the sole authoritative owner of the Administrative Console UI, the Local Privileged Admin API, workspace orchestration, and cross-repository verification.

---

## 1. Multi-Repository Ownership Architecture

The Truthprenuer engineering system is partitioned across three distinct repositories with strict separation of concerns:

| Repository | GitHub Remote | Ownership & Purpose | Security Boundary |
|---|---|---|---|
| **`TRUTHPRENUER-ADMIN`** (This Repo) | `https://github.com/nenavathvimal-nayak/TRUTHPRENUER-ADMIN.git` | **Admin Console UI** (React 19 / Vite 8), **Local Privileged Admin API** (FastAPI), Workspace Orchestration | **Strict Localhost Only** (`127.0.0.1:60135` UI, `127.0.0.1:60136` API). Zero public ingress. |
| **`Truthprenuer`** (Submodule) | `https://github.com/nenavathvimal-nayak/Truthprenuer.git` | **User-Facing Applications Only** (Flutter Universal Client: Web, iOS, Android, Desktop) | Public deployment to app stores & consumer web hosting. Zero Admin UI code. |
| **`TRUTHPRENUER-PLATFORM`** | `https://github.com/nenavathvimal-nayak/TRUTHPRENUER-PLATFORM.git` | **Shared Platform Core**: Public APIs, PostgreSQL schemas, algorithms, and container infrastructure | Cloud-hosted services. Never exposes administrative endpoints. |

---

## 2. Workspace Directory Structure

```text
TRUTHPRENUER-ADMIN/ (Parent Orchestrator & Admin Hub)
├── .git/                                      # Main repository Git metadata
├── .gitmodules                                # Submodule registration for Truthprenuer
├── .gitignore                                 # Root protection (secrets, node_modules, build outputs)
├── README.md                                  # Workspace overview (this file)
├── CONTRIBUTING.md                            # Development & commit standards
├── SECURITY.md                                # Security & loopback isolation policy
├── CHANGELOG.md                               # Release & architectural change history
│
├── ADMIN/                                     # Sole Source of Truth for Admin Console
│   ├── src/                                   # React 19 / Vite 8 frontend components & pages
│   ├── backend/                               # Local-only privileged Admin API (127.0.0.1:60136)
│   ├── package.json & vite.config.ts          # Bound strictly to 127.0.0.1:60135 (strictPort: true)
│   ├── TESTS/                                 # Admin loopback & privileged API test suites
│   └── RUN_LOCAL/                             # Dedicated local startup scripts
│
├── DEVTOOLS/
│   └── SCRIPTS/
│       ├── start_admin_60135.sh               # Root launcher for Admin UI (127.0.0.1:60135)
│       ├── start_admin_api_60136.sh           # Root launcher for Privileged Admin API (127.0.0.1:60136)
│       └── validate_workspace.sh              # 15-point cross-repo integration validator
│
├── PRODUCT/
│   ├── REPOSITORY_MANAGEMENT/                 # Architecture, inventory, setup & migration plans
│   └── QA_REPORTS/                            # Integration QA reports & empirical test evidence
│
└── USERS/
    └── FLUTTER/
        └── taeed_flutter_source/              # Truthprenuer Submodule (User Applications Only)
            └── USERS/                         # Flutter 3.29 universal client (Web, iOS, Android, Desktop)
```

---

## 3. Quick Start & Local Execution

### 3.1 Initializing the Workspace
```bash
git clone --recurse-submodules https://github.com/nenavathvimal-nayak/TRUTHPRENUER-ADMIN.git
cd TRUTHPRENUER-ADMIN
```

### 3.2 Running the Private Admin Console
The Admin Console and its privileged API are strictly bound to local loopback:

```bash
# Terminal 1: Start the Local Privileged Admin API (Port 60136)
./DEVTOOLS/SCRIPTS/start_admin_api_60136.sh

# Terminal 2: Start the Admin UI (Port 60135)
./DEVTOOLS/SCRIPTS/start_admin_60135.sh
```

- **Admin UI:** `http://127.0.0.1:60135`
- **Privileged Admin API:** `http://127.0.0.1:60136`

### 3.3 Validating Workspace Health & Security
Run the automated validator to verify all 15 ownership, security, and test checks:

```bash
./DEVTOOLS/SCRIPTS/validate_workspace.sh
```
