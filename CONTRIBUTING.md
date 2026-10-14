# Contributing to Truthprenuer Workspace

Thank you for contributing to the Truthprenuer ecosystem. Because this workspace operates as a dual-repository architecture with a nested Git submodule, please adhere strictly to these contribution guidelines.

---

## 1. Golden Rules of Dual-Repo Contribution

1. **Know Your Working Boundary:**
   - Edits in `PRODUCT/` or `DEVTOOLS/` must be committed to the **`TRUTHPRENUER-ADMIN`** repository.
   - Edits in `USERS/FLUTTER/taeed_flutter_source/` (including `ADMIN/`, `USERS/`, `backend/`, and `DATABASE/`) must be committed inside the **submodule directory** to `Truthprenuer.git`.
2. **Submodule Pointer Discipline:**
   - When pushing commits to `Truthprenuer.git`, you must also advance the submodule gitlink pointer in `TRUTHPRENUER-ADMIN` and commit it.
   - See [COMMIT_AND_PUSH_WORKFLOW.md](file:///Volumes/NAYAK/TRUTHRENUER%20ADM/TRUTHPRENUER-ADMIN/PRODUCT/REPOSITORY_MANAGEMENT/COMMIT_AND_PUSH_WORKFLOW.md) for step-by-step commands.
3. **Admin Localhost Isolation:**
   - The Admin console is local-only (`127.0.0.1:60135`). Never modify server binding configurations to expose `0.0.0.0` or allow WAN/LAN ingress.
4. **Never Commit Secrets:**
   - Keep `.env`, `.env.json`, private keys, and service account tokens out of Git. Both repositories contain pre-configured `.gitignore` protections.

---

## 2. Commit Message Standards

Use Conventional Commits formatting:

```text
<type>(<scope>): <short description>

[optional body]
```

- **`feat`**: New user-facing feature or administrative capability
- **`fix`**: Bug fix in application or script logic
- **`refactor`**: Code or path refactoring without functional changes
- **`docs`**: Documentation creation or revisions
- **`chore`**: Maintenance, dependency upgrades, or submodule pointer updates

---

## 3. Pull Request Guidelines

1. Ensure all static analysis and unit tests pass before opening a PR:
   - In `USERS/`: `flutter analyze` and `flutter test`
   - In `ADMIN/`: `npm run build`
   - In `backend/`: `pytest tests/`
2. Never force-push (`git push --force`) to shared branches.
