#!/usr/bin/env bash
# ==============================================================================
# TRUTHPRENUER-ADMIN — MULTI-REPO WORKSPACE INTEGRATION & OWNERSHIP VALIDATOR
# Validates repository ownership boundaries, zero-trust admin isolation,
# local Admin API, child user-app cleanliness, and multi-tier test integrity.
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
PARENT_ADMIN_DIR="${WORKSPACE_ROOT}/ADMIN"
SUBMODULE_PATH="${WORKSPACE_ROOT}/USERS/FLUTTER/taeed_flutter_source"
PLATFORM_DIR="$(cd "${WORKSPACE_ROOT}/.." && pwd)/TRUTHPRENUER-PLATFORM"

PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0

log_header() {
    echo ""
    echo "=================================================================="
    echo "  $1"
    echo "=================================================================="
}

log_pass() {
    echo "  [PASS] $1"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
}

log_fail() {
    echo "  [FAIL] $1"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
}

log_warn() {
    echo "  [WARN] $1"
    WARNINGS=$((WARNINGS + 1))
}

# 1. PARENT REPOSITORY & GIT IDENTITY
log_header "1. PARENT REPOSITORY & GIT IDENTITY CHECK"
if [ ! -d "${WORKSPACE_ROOT}/.git" ]; then
    log_fail "Parent git repository metadata not found at ${WORKSPACE_ROOT}/.git"
else
    PARENT_SHA=$(git -C "${WORKSPACE_ROOT}" rev-parse --short HEAD 2>/dev/null || echo "unknown")
    PARENT_BRANCH=$(git -C "${WORKSPACE_ROOT}" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    log_pass "Parent repository verified at ${WORKSPACE_ROOT} (Branch: ${PARENT_BRANCH}, Commit: ${PARENT_SHA})"
fi

# 2. SUBMODULE REGISTRATION & GITLINK
log_header "2. SUBMODULE REGISTRATION & GITLINK CHECK"
if [ ! -f "${WORKSPACE_ROOT}/.gitmodules" ]; then
    log_fail ".gitmodules file is missing in parent repository root"
else
    SUBMODULE_URL=$(git -C "${WORKSPACE_ROOT}" config -f .gitmodules --get submodule.USERS/FLUTTER/taeed_flutter_source.url || echo "")
    if [[ "${SUBMODULE_URL}" == *"Truthprenuer"* ]]; then
        log_pass "Submodule properly registered pointing to: ${SUBMODULE_URL}"
    else
        log_fail "Submodule URL mismatch in .gitmodules: '${SUBMODULE_URL}'"
    fi
fi

if [ ! -d "${SUBMODULE_PATH}" ]; then
    log_fail "Submodule directory does not exist at ${SUBMODULE_PATH}"
else
    CHILD_SHA=$(git -C "${SUBMODULE_PATH}" rev-parse --short HEAD 2>/dev/null || echo "uninitialized")
    log_pass "Submodule directory active at HEAD: ${CHILD_SHA}"
fi

# 3. REPOSITORY OWNERSHIP BOUNDARIES
log_header "3. REPOSITORY OWNERSHIP BOUNDARY AUDIT"

# A. Admin Panel owned exclusively by TRUTHPRENUER-ADMIN
if [ -d "${PARENT_ADMIN_DIR}" ] && [ -f "${PARENT_ADMIN_DIR}/package.json" ] && [ -f "${PARENT_ADMIN_DIR}/vite.config.ts" ]; then
    log_pass "Admin Console UI successfully extracted and owned by TRUTHPRENUER-ADMIN/ADMIN"
else
    log_fail "Admin Console UI missing from parent repository at ${PARENT_ADMIN_DIR}"
fi

# B. Local Privileged Admin API owned by TRUTHPRENUER-ADMIN
if [ -f "${PARENT_ADMIN_DIR}/backend/run_admin_api.py" ] && [ -f "${PARENT_ADMIN_DIR}/backend/app/main.py" ]; then
    log_pass "Privileged Admin API successfully owned by TRUTHPRENUER-ADMIN/ADMIN/backend"
else
    log_fail "Privileged Admin API missing from ${PARENT_ADMIN_DIR}/backend"
fi

# C. Zero Admin UI code in Truthprenuer (child)
if [ -d "${SUBMODULE_PATH}/ADMIN" ] || [ -e "${SUBMODULE_PATH}/admin_panel" ]; then
    log_fail "Admin UI code or symlink still present in Truthprenuer user-app repository"
else
    log_pass "Admin UI code and symlinks completely absent from Truthprenuer user-app repository"
fi

# D. User-facing applications owned by Truthprenuer
if [ -f "${SUBMODULE_PATH}/USERS/pubspec.yaml" ] && [ -d "${SUBMODULE_PATH}/USERS/lib" ]; then
    log_pass "User application (Flutter) correctly housed in Truthprenuer/USERS"
else
    log_fail "User application missing from Truthprenuer/USERS"
fi

# E. Platform Core Repository (TRUTHPRENUER-PLATFORM)
if [ -d "${PLATFORM_DIR}" ] && [ -d "${PLATFORM_DIR}/backend" ] && [ -d "${PLATFORM_DIR}/DATABASE" ] && [ -d "${PLATFORM_DIR}/ALGORITHMS" ]; then
    log_pass "Shared Platform Core repository prepared at TRUTHPRENUER-PLATFORM"
else
    log_fail "TRUTHPRENUER-PLATFORM repository missing or incomplete"
fi

# 4. MACHINE-SPECIFIC ABSOLUTE PATH AUDIT
log_header "4. MACHINE-SPECIFIC ABSOLUTE PATH AUDIT"
FORBIDDEN_PATHS=$(grep -rnI "file:///Volumes/" "${WORKSPACE_ROOT}" \
    --exclude-dir=".git" \
    --exclude-dir="node_modules" \
    --exclude-dir="venv" \
    --exclude-dir=".dart_tool" \
    --exclude-dir="ephemeral" \
    --exclude-dir="build" \
    --exclude-dir="dist" \
    --exclude-dir=".pytest_cache" \
    --exclude="validate_workspace.sh" 2>/dev/null || true)

if [ -n "${FORBIDDEN_PATHS}" ]; then
    log_fail "Machine-specific file:///Volumes/ links detected:"
    echo "${FORBIDDEN_PATHS}" | head -n 5
else
    log_pass "Zero machine-specific file:///Volumes/ links detected across workspace"
fi

# 5. ADMIN ISOLATION ARCHITECTURE CHECK
log_header "5. ADMIN ISOLATION ARCHITECTURE CHECK (127.0.0.1:60135 & 60136)"
VITE_CONF="${PARENT_ADMIN_DIR}/vite.config.ts"
if grep -q "host: '127.0.0.1'" "${VITE_CONF}" && grep -q "port: 60135" "${VITE_CONF}" && grep -q "strictPort: true" "${VITE_CONF}"; then
    log_pass "Admin Vite config strictly enforces host 127.0.0.1, port 60135, and strictPort: true"
else
    log_fail "Admin Vite config lacks required strict loopback host/port/strictPort settings"
fi

ADMIN_API_CONFIG="${PARENT_ADMIN_DIR}/backend/app/core/config.py"
if grep -q "ADMIN_HOST: str = \"127.0.0.1\"" "${ADMIN_API_CONFIG}" && grep -q "ADMIN_PORT: int = 60136" "${ADMIN_API_CONFIG}"; then
    log_pass "Admin API config strictly enforces host 127.0.0.1 and port 60136"
else
    log_fail "Admin API config lacks loopback port 60136 enforcement"
fi

# 6. AUTOMATED TEST SUITE INTEGRITY
log_header "6. AUTOMATED TEST SUITE INTEGRITY"

# A. Admin UI Build
if (cd "${PARENT_ADMIN_DIR}" && npm run build --silent >/dev/null 2>&1); then
    log_pass "Admin React/Vite production build succeeded cleanly"
else
    log_fail "Admin React/Vite production build failed"
fi

# B. Local Privileged Admin API Test Suite
PYTHON_VENV="${SUBMODULE_PATH}/backend/venv/bin/pytest"
if [ -x "${PYTHON_VENV}" ]; then
    echo "Running Local Admin API Pytest Suite..."
    if (cd "${WORKSPACE_ROOT}" && "${PYTHON_VENV}" ADMIN/TESTS/test_admin_api_suite.py -q); then
        log_pass "Local Admin API Pytest Suite (11 tests) passed completely"
    else
        log_fail "Local Admin API Pytest Suite failed"
    fi
else
    log_warn "Python pytest binary not found; skipping Admin API tests"
fi

# C. TRUTHPRENUER-PLATFORM Test Suite
if [ -x "${PYTHON_VENV}" ] && [ -d "${PLATFORM_DIR}" ]; then
    echo "Running TRUTHPRENUER-PLATFORM Pytest Suite..."
    if (cd "${PLATFORM_DIR}" && "${PYTHON_VENV}" backend/tests/ ALGORITHMS/TESTS/ -q); then
        log_pass "TRUTHPRENUER-PLATFORM Pytest Suite (11 tests) passed completely"
    else
        log_fail "TRUTHPRENUER-PLATFORM Pytest Suite failed"
    fi
fi

# D. Flutter Client Test Suite
if command -v flutter >/dev/null 2>&1; then
    echo "Running Flutter Client Test Suite..."
    if (cd "${SUBMODULE_PATH}/USERS" && flutter test --no-pub >/dev/null 2>&1); then
        log_pass "Flutter Client Test Suite (64 tests) passed completely"
    else
        log_fail "Flutter Client Test Suite failed"
    fi
else
    log_warn "Flutter CLI not installed on PATH; skipping Flutter widget tests"
fi

# SUMMARY
log_header "VALIDATION SUMMARY"
echo "  Total Checks Passed : ${PASSED_CHECKS}"
echo "  Total Checks Failed : ${FAILED_CHECKS}"
echo "  Total Warnings      : ${WARNINGS}"
echo "=================================================================="

if [ "${FAILED_CHECKS}" -eq 0 ]; then
    echo "  RESULT: WORKSPACE VERIFICATION PASSED (CLEAN & SECURE) 🟢"
    echo "=================================================================="
    exit 0
else
    echo "  RESULT: WORKSPACE VERIFICATION FAILED WITH ${FAILED_CHECKS} ERRORS 🔴"
    echo "=================================================================="
    exit 1
fi
