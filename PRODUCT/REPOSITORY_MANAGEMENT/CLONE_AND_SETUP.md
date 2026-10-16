# Workspace Clone & Initial Setup Guide

This guide describes how to clone, initialize, and configure the complete **`TRUTHPRENUER-ADMIN`** workspace, including the nested **`taeed_flutter_source`** submodule.

---

## 1. Prerequisites

Before beginning setup, ensure your development workstation meets the required toolchain specifications:

- **Git:** Version `2.30.0` or higher
- **Node.js:** Version `20.x` or `22.x` (LTS) & `npm`
- **Flutter SDK:** Version `3.29.x` (Channel: `stable`)
- **Dart SDK:** Version `3.7.x` (Bundled with Flutter)
- **Python:** Version `3.11.x` (for FastAPI backend & algorithm validation)
- **Xcode & CocoaPods:** (macOS only, for iOS/macOS compilation)
- **Android Studio / Android SDK:** (for Android compilation)

---

## 2. Cloning the Workspace

### Method A: Single-Step Clone (Recommended)
Clone the main repository with recursive submodule initialization:

```bash
git clone --recurse-submodules https://github.com/nenavathvimal-nayak/TRUTHPRENUER-ADMIN.git
cd TRUTHPRENUER-ADMIN
```

### Method B: Standard Clone Followed by Submodule Init
If the repository was cloned without `--recurse-submodules`:

```bash
# 1. Clone parent repository
git clone https://github.com/nenavathvimal-nayak/TRUTHPRENUER-ADMIN.git
cd TRUTHPRENUER-ADMIN

# 2. Initialize and fetch the nested submodule
git submodule update --init --recursive
```

---

## 3. Submodule Verification

Verify that both repository contexts are properly configured:

```bash
# Verify parent repository
git status

# Verify submodule pointer and active commit
git submodule status

# Expected output format:
#  <commit-sha> USERS/FLUTTER/taeed_flutter_source (heads/main)
```

Ensure the submodule is checked out on the working branch (e.g., `main`):
```bash
cd USERS/FLUTTER/taeed_flutter_source
git checkout main
cd ../../..
```

---

## 4. Component Setup & Dependency Installation

### 4.1 Admin Console (React 19 / Vite 8)
The admin application provides administrative moderation, audit-log viewing, and system monitoring.

```bash
cd USERS/FLUTTER/taeed_flutter_source/ADMIN
npm ci
```

### 4.2 Flutter Universal Client (`USERS/`)
The consumer Flutter application supports iOS, Android, Desktop, and Web.

```bash
cd USERS/FLUTTER/taeed_flutter_source/USERS
flutter pub get
flutter analyze
```

### 4.3 Gateway Backend (FastAPI / Python)
```bash
cd USERS/FLUTTER/taeed_flutter_source/backend
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 5. Running Applications Locally

### 5.1 Starting the Private Localhost Admin Console
The Admin Console is strictly bounded to `http://127.0.0.1:60135` and refuses external or LAN connections.

```bash
# From workspace root:
./DEVTOOLS/SCRIPTS/start_admin_60135.sh

# Or directly from the submodule:
cd USERS/FLUTTER/taeed_flutter_source/ADMIN
npm run dev
```
Open your browser at: **`http://127.0.0.1:60135`**

### 5.2 Starting the Flutter Client
```bash
cd USERS/FLUTTER/taeed_flutter_source/USERS

# Run on Chrome (Web port 8080)
flutter run -d chrome --web-port=8080

# Or run on iOS Simulator
flutter run -d iPhone
```

### 5.3 Starting the Backend API
```bash
cd USERS/FLUTTER/taeed_flutter_source/backend
source venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

---

## 6. Verification Checklist

Run the comprehensive workspace validation script from root:
```bash
./DEVTOOLS/SCRIPTS/validate_workspace.sh
```

- [ ] `git submodule status` reports a clean submodule reference without a leading `-` (uninitialized).
- [ ] `./DEVTOOLS/SCRIPTS/validate_workspace.sh` passes with zero errors (all 22 checks passing).
- [ ] Admin console boots successfully on `http://127.0.0.1:60135`.
- [ ] `flutter pub get` and `flutter test` execute cleanly.
- [ ] No `.env` or secret keys are present in untracked/staged git files.
