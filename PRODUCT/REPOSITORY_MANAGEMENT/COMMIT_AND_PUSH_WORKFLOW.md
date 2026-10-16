# Git Commit & Push Synchronization Workflow

This document provides explicit, step-by-step instructions for developers making changes in either the **Main Repository (`TRUTHPRENUER-ADMIN`)** or the **Nested Submodule (`taeed_flutter_source`)**.

---

## 1. Core Principle: Boundary Awareness

Always know which Git repository root owns the file you are modifying:

```text
<workspace_root>/                                     <-- Parent Git Root (TRUTHPRENUER-ADMIN.git)
│
├── PRODUCT/                                          <-- Owned by Parent
├── DEVTOOLS/                                         <-- Owned by Parent
├── .gitignore, .gitmodules                           <-- Owned by Parent
│
└── USERS/FLUTTER/taeed_flutter_source/               <-- Submodule Git Root (Truthprenuer.git)
    ├── ADMIN/                                        <-- Owned by Submodule
    ├── USERS/                                        <-- Owned by Submodule
    ├── backend/                                      <-- Owned by Submodule
    ├── DATABASE/                                     <-- Owned by Submodule
    └── ALGORITHMS/                                   <-- Owned by Submodule
```

---

## 2. Scenario A: Editing Only Main Repository Files

Use this workflow when editing files in `PRODUCT/`, `DEVTOOLS/`, or root configs.

```bash
# 1. From the repository root:
cd "$(git rev-parse --show-toplevel)"

# 2. Check current status
git status

# 3. Stage and review changes
git add PRODUCT/ DEVTOOLS/
git diff --staged

# 4. Commit with descriptive semantic message
git commit -m "docs(management): update deployment runbook"

# 5. Push to TRUTHPRENUER-ADMIN remote
git push origin main
```

---

## 3. Scenario B: Editing Files in the Flutter Submodule

Use this workflow when modifying Flutter code (`USERS/`), React Admin code (`ADMIN/`), Backend (`backend/`), or Database migrations (`DATABASE/`).

```bash
# 1. Enter the submodule directory
cd USERS/FLUTTER/taeed_flutter_source

# 2. Verify you are on the expected branch
git branch -vv

# 3. Inspect status inside the submodule
git status

# 4. Stage your changes (submodule's .gitignore protects .env and node_modules)
git add USERS/lib/ ADMIN/src/
git diff --staged

# 5. Commit within the submodule
git commit -m "feat(auth): add biometric login support"

# 6. Push to the Truthprenuer.git remote
git push origin main
```

> [!IMPORTANT]
> Committing and pushing inside the submodule changes the remote `Truthprenuer.git`, but the parent repository now needs to be told about this new commit! Proceed to Scenario C.

---

## 4. Scenario C: Updating Main Repository Submodule Pointer

Whenever the submodule has advanced (either via local commit or git pull):

```bash
# 1. Return to the main repository root
cd "$(git rev-parse --show-toplevel)"

# 2. Observe git status
git status
# You will see:
#   modified: USERS/FLUTTER/taeed_flutter_source (new commits)

# 3. Inspect the submodule commit delta
git diff USERS/FLUTTER/taeed_flutter_source

# 4. Stage and commit the updated submodule gitlink
git add USERS/FLUTTER/taeed_flutter_source
git commit -m "chore(submodule): advance taeed_flutter_source pointer to latest main"

# 5. Push to the TRUTHPRENUER-ADMIN remote
git push origin main
```

---

## 5. Scenario D: Pulling Upstream Changes

### Pulling into Both Repositories Simultaneously
To pull the latest commits for the main repository and synchronize all nested submodules to their recorded commits:

```bash
cd "$(git rev-parse --show-toplevel)"

# Pull parent repo commits and update submodules recursively
git pull --recurse-submodules
git submodule update --init --recursive
```

### Pulling Latest Upstream directly in Submodule
To bring in changes that teammates pushed directly to `Truthprenuer.git`:

```bash
cd USERS/FLUTTER/taeed_flutter_source
git pull origin main

# Then update parent pointer (Scenario C)
cd ../../..
git add USERS/FLUTTER/taeed_flutter_source
git commit -m "chore(submodule): sync taeed_flutter_source from upstream"
git push origin main
```

---

## 6. Troubleshooting & Recovery

### Issue: Submodule in "Detached HEAD" State
Submodules often check out detached HEADs during `git submodule update`.

**Fix:**
```bash
cd USERS/FLUTTER/taeed_flutter_source
git checkout main
git pull origin main
```

### Issue: Accidentally Staged Submodule Uncommitted Content
If the parent repo warns `modified: USERS/FLUTTER/taeed_flutter_source (modified content, untracked content)`:

**Fix:**
1. Do **not** commit in the parent repository yet.
2. Enter the submodule:
   ```bash
   cd USERS/FLUTTER/taeed_flutter_source
   git status
   ```
3. Commit or clean any uncommitted edits inside the submodule first.
4. Return to parent and stage only the clean submodule pointer.
