# TRUTHPRENUER-ADMIN — Main Workspace & Admin Console

Welcome to the **Truthprenuer Admin & Workspace Orchestration Repository**. This repository serves as the central operational hub, management workspace, and integration point for the Truthprenuer ecosystem.

---

## 1. Dual-Repository Architectural Model

Truthprenuer is architected across two distinct, independently maintained GitHub repositories:

1. **`TRUTHPRENUER-ADMIN` (This Repository)**
   - **GitHub Remote:** `https://github.com/nenavathvimal-nayak/TRUTHPRENUER-ADMIN.git`
   - **Role:** Main project orchestrator, workspace integration, root devtools, and architectural specifications.
   - **Nesting:** Contains the independent Flutter core as a Git Submodule at `USERS/FLUTTER/taeed_flutter_source`.

2. **`taeed_flutter_source` (Independent Submodule Repository)**
   - **GitHub Remote:** `https://github.com/nenavathvimal-nayak/Truthprenuer.git`
   - **Role:** Multi-platform Flutter client application (iOS, Android, Web, Desktop), FastAPI gateway backend, Supabase database schemas, and hypothesis scoring algorithms.

> [!NOTE]
> For complete details on repository boundaries, ownership, and synchronization, see [REPOSITORY_RELATIONSHIP.md](file:///Volumes/NAYAK/TRUTHRENUER%20ADM/TRUTHPRENUER-ADMIN/PRODUCT/REPOSITORY_MANAGEMENT/REPOSITORY_RELATIONSHIP.md).

---

## 2. Workspace Directory Structure

```text
TRUTHPRENUER-ADMIN/
│
├── .git/                                      # Main repository Git metadata
├── .gitmodules                                # Submodule registration for taeed_flutter_source
├── .gitignore                                 # Root protection (secrets, node_modules, build outputs)
├── README.md                                  # Workspace overview (this file)
├── CONTRIBUTING.md                            # Development & commit standards
├── SECURITY.md                                # Security & loopback isolation policy
├── CHANGELOG.md                               # Release & architectural change history
│
├── DEVTOOLS/
│   └── SCRIPTS/
│       └── start_admin_60135.sh               # Root launcher for private Admin Console
│
├── PRODUCT/
│   ├── REPOSITORY_MANAGEMENT/
│   │   ├── REPOSITORY_RELATIONSHIP.md         # Dual-repo architecture & ownership rules
│   │   ├── CLONE_AND_SETUP.md                 # Complete developer onboarding guide
│   │   ├── COMMIT_AND_PUSH_WORKFLOW.md        # Independent commit & push instructions
│   │   └── REPOSITORY_INVENTORY.md            # Git telemetry & remote tracking inventory
│   └── QA_REPORTS/
│       └── REPOSITORY_INTEGRATION_REPORT.md   # Architectural QA report & verification
│
└── USERS/
    └── FLUTTER/
        └── taeed_flutter_source/              # Independent Git Submodule (Truthprenuer.git)
            ├── ADMIN/                         # React 19 / Vite 8 Private Admin Console
            ├── USERS/                         # Flutter 3.29 Multi-platform Application
            ├── backend/                       # FastAPI gateway backend
            ├── DATABASE/                      # Database migrations, policies & triggers
            └── ALGORITHMS/                    # Hypothesis validation & scoring algorithms
```

---

## 3. Quick Start

### 3.1 Cloning with Submodules
```bash
git clone --recurse-submodules https://github.com/nenavathvimal-nayak/TRUTHPRENUER-ADMIN.git
cd TRUTHPRENUER-ADMIN
```

If already cloned without `--recurse-submodules`:
```bash
git submodule update --init --recursive
```

### 3.2 Running the Private Localhost Admin Console
The Admin Console is strictly bounded to `http://127.0.0.1:60135` (fail-fast, zero LAN/WAN exposure):
```bash
./DEVTOOLS/SCRIPTS/start_admin_60135.sh
```
Open browser at: **`http://127.0.0.1:60135`**

### 3.3 Running the Flutter Client
```bash
cd USERS/FLUTTER/taeed_flutter_source/USERS
flutter pub get
flutter run -d chrome --web-port=8080
```

---

## 4. Documentation Index

- **Architecture & Ownership:** [REPOSITORY_RELATIONSHIP.md](file:///Volumes/NAYAK/TRUTHRENUER%20ADM/TRUTHPRENUER-ADMIN/PRODUCT/REPOSITORY_MANAGEMENT/REPOSITORY_RELATIONSHIP.md)
- **Setup & Installation:** [CLONE_AND_SETUP.md](file:///Volumes/NAYAK/TRUTHRENUER%20ADM/TRUTHPRENUER-ADMIN/PRODUCT/REPOSITORY_MANAGEMENT/CLONE_AND_SETUP.md)
- **Commit & Push Guide:** [COMMIT_AND_PUSH_WORKFLOW.md](file:///Volumes/NAYAK/TRUTHRENUER%20ADM/TRUTHPRENUER-ADMIN/PRODUCT/REPOSITORY_MANAGEMENT/COMMIT_AND_PUSH_WORKFLOW.md)
- **Inventory & Telemetry:** [REPOSITORY_INVENTORY.md](file:///Volumes/NAYAK/TRUTHRENUER%20ADM/TRUTHPRENUER-ADMIN/PRODUCT/REPOSITORY_MANAGEMENT/REPOSITORY_INVENTORY.md)
- **Integration QA Report:** [REPOSITORY_INTEGRATION_REPORT.md](file:///Volumes/NAYAK/TRUTHRENUER%20ADM/TRUTHPRENUER-ADMIN/PRODUCT/QA_REPORTS/REPOSITORY_INTEGRATION_REPORT.md)
