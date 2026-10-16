#!/usr/bin/env bash
# ==============================================================================
# TRUTHPRENUER-ADMIN — ROOT WORKSPACE ADMIN LAUNCHER
# Strictly delegates to the isolated admin launcher at:
# USERS/FLUTTER/taeed_flutter_source/ADMIN/RUN_LOCAL/start_admin_60135.sh
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ADMIN_LAUNCHER="${WORKSPACE_ROOT}/ADMIN/RUN_LOCAL/start_admin_60135.sh"

if [ ! -f "${ADMIN_LAUNCHER}" ]; then
    echo "ERROR: Admin launcher not found at:"
    echo "  ${ADMIN_LAUNCHER}"
    exit 1
fi

chmod +x "${ADMIN_LAUNCHER}"
exec "${ADMIN_LAUNCHER}" "$@"
