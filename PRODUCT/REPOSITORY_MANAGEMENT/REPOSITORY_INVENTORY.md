# Repository Inventory & Baseline Telemetry

This inventory logs the operational parameters, Git metadata, remotes, and branch baselines for both repositories comprising the Truthprenuer architecture.

---

## 1. Primary Repository: TRUTHPRENUER-ADMIN

| Parameter | Value |
|---|---|
| **Repository Name** | `TRUTHPRENUER-ADMIN` |
| **Local File Path** | `<workspace_root>` |
| **Git Root** | `<workspace_root>/.git` |
| **Active Branch** | `main` |
| **Configured Remote** | `origin` |
| **Remote URL** | `https://github.com/nenavathvimal-nayak/TRUTHPRENUER-ADMIN.git` |
| **Active Commit SHA** | `20e75a8` |
| **Working Tree State** | Verified Clean |
| **Role & Purpose** | Parent Orchestrator, Workspace Integration, Workspace Runbooks & Security Specs |

### Key Files in Parent Repository
- `.gitmodules`: Submodule declaration for `USERS/FLUTTER/taeed_flutter_source`
- `.gitignore`: Protects workspace from OS, environment (`.env`), build outputs, and node dependencies
- `PRODUCT/REPOSITORY_MANAGEMENT/`: Dual-repo architecture and synchronization guides
- `PRODUCT/QA_REPORTS/`: Verification and integration reports
- `DEVTOOLS/SCRIPTS/`: Local administrative runner tools

---

## 2. Nested Submodule Repository: taeed_flutter_source

| Parameter | Value |
|---|---|
| **Repository Name** | `taeed_flutter_source` (Remote: `Truthprenuer`) |
| **Local File Path** | `<workspace_root>/USERS/FLUTTER/taeed_flutter_source` |
| **Git Root** | Dedicated Git metadata mapped via `.git` file / gitdir |
| **Active Branch** | `main` |
| **Configured Remote** | `origin` |
| **Remote URL** | `https://github.com/nenavathvimal-nayak/Truthprenuer.git` |
| **Active Commit SHA** | `fd51306` |
| **Working Tree State** | Verified Clean |
| **Role & Purpose** | Flutter Universal Mobile/Web Clients, FastAPI Backend, Database Migrations, Algorithms |

### Subsystems Hosted in Submodule
- `ADMIN/`: React 19 / Vite 8 administrative console (strictly local loopback `127.0.0.1:60135`)
- `USERS/`: Flutter 3.29 universal multi-platform client (iOS, Android, Web, Desktop)
- `backend/`: FastAPI backend with rate limiting, prompt defense, and JWT auth
- `DATABASE/`: PostgreSQL / Supabase schemas, triggers, RLS policies, and migrations
- `ALGORITHMS/`: Hypothesis scoring, validation, and analytics domain logic
- `INFRASTRUCTURE/`: Docker Compose local and production deployments, Prometheus alerts
- `DEVTOOLS/`: Repository validators and security scan tools

---

## 3. Remote Verification Matrix

| Remote Target | Reachability | Auth Protocol | Credentials Included |
|---|---|---|---|
| `TRUTHPRENUER-ADMIN.git` | Verified | HTTPS (Keychain / Helper) | None (Redacted) |
| `Truthprenuer.git` | Verified | HTTPS (Keychain / Helper) | None (Redacted) |

---

## 4. Submodule Integration Audit

```bash
# Submodule declaration in parent:
[submodule "USERS/FLUTTER/taeed_flutter_source"]
	path = USERS/FLUTTER/taeed_flutter_source
	url = https://github.com/nenavathvimal-nayak/Truthprenuer.git
```

- **Recorded Commit in Parent Gitlink:** `fd51306`
- **Submodule HEAD Commit:** `fd51306`
- **Integrity Status:** In sync (zero drift, no uncommitted submodule changes)
