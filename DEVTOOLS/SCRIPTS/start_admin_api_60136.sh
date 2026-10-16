#!/usr/bin/env bash
# ==============================================================================
# TRUTHPRENUER — LOCAL PRIVILEGED ADMIN API LAUNCHER
# Enforces strict loopback isolation on http://127.0.0.1:60136
# ==============================================================================

set -euo pipefail

ADMIN_API_HOST="127.0.0.1"
ADMIN_API_PORT="60136"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ADMIN_BACKEND_DIR="${WORKSPACE_ROOT}/ADMIN/backend"
PYTHON_BIN="${WORKSPACE_ROOT}/USERS/FLUTTER/taeed_flutter_source/backend/venv/bin/python"

if [ ! -x "${PYTHON_BIN}" ]; then
    PYTHON_BIN="python3"
fi

echo "=================================================================="
echo "  TRUTHPRENUER — LOCAL PRIVILEGED ADMIN API SERVICE"
echo "=================================================================="
echo "Interface: ${ADMIN_API_HOST} (Strict Loopback Only)"
echo "Port     : ${ADMIN_API_PORT}"
echo "------------------------------------------------------------------"

# Fail-fast port conflict check
if lsof -Pi :${ADMIN_API_PORT} -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "ERROR: Port ${ADMIN_API_PORT} is already in use by another process!"
    lsof -i :${ADMIN_API_PORT}
    exit 1
fi

cd "${ADMIN_BACKEND_DIR}"
export PYTHONPATH="${ADMIN_BACKEND_DIR}"
exec "${PYTHON_BIN}" run_admin_api.py
