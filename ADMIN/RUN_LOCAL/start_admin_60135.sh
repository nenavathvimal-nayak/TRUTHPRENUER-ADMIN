#!/usr/bin/env bash
# ==============================================================================
# TRUTHPRENUER — PRIVATE LOCALHOST ADMIN CONSOLE STARTUP SCRIPT
# Enforces strict loopback isolation on http://127.0.0.1:60135
# Fails fast if port 60135 is occupied or if external binding is attempted.
# ==============================================================================

set -euo pipefail

ADMIN_HOST="127.0.0.1"
ADMIN_PORT="60135"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ADMIN_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "=================================================================="
echo "  TRUTHPRENUER — PRIVATE LOCAL ADMIN CONSOLE STARTUP"
echo "=================================================================="
echo "Target Interface : ${ADMIN_HOST} (Strict Loopback Only)"
echo "Target Port      : ${ADMIN_PORT}"
echo "Security Boundary: ZERO PUBLIC EXPOSURE / LOCALHOST ISOLATION"
echo "------------------------------------------------------------------"

# 1. Fail-fast port conflict check
if lsof -Pi :${ADMIN_PORT} -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "ERROR: Port ${ADMIN_PORT} is already in use by another process!"
    echo "Failing fast to prevent accidental port fallback or collision."
    lsof -i :${ADMIN_PORT}
    exit 1
fi

# 2. Verify admin_panel directory exists
if [ ! -d "${ADMIN_DIR}" ]; then
    echo "ERROR: Admin panel directory not found at ${ADMIN_DIR}"
    exit 1
fi

cd "${ADMIN_DIR}"

# 3. Verify node_modules installed
if [ ! -d "node_modules" ]; then
    echo "Installing admin panel dependencies..."
    npm ci
fi

echo "Starting Admin Console on http://${ADMIN_HOST}:${ADMIN_PORT}..."
echo "Press Ctrl+C to stop."
echo "=================================================================="

# Explicitly bind to 127.0.0.1:60135 with strictPort
export HOST="${ADMIN_HOST}"
export PORT="${ADMIN_PORT}"

exec npx vite --host "${ADMIN_HOST}" --port "${ADMIN_PORT}" --strictPort
