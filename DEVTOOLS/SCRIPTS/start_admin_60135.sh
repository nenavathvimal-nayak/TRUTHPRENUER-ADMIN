#!/usr/bin/env bash
# ==============================================================================
# TRUTHPRENUER-ADMIN — ROOT WORKSPACE ADMIN LAUNCHER
# Strictly delegates to the isolated admin launcher at:
# USERS/FLUTTER/taeed_flutter_source/ADMIN/RUN_LOCAL/start_admin_60135.sh
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
SUBMODULE_ADMIN_LAUNCHER="${WORKSPACE_ROOT}/USERS/FLUTTER/taeed_flutter_source/ADMIN/RUN_LOCAL/start_admin_60135.sh"

if [ ! -f "${SUBMODULE_ADMIN_LAUNCHER}" ]; then
    echo "ERROR: Submodule admin launcher not found at:"
    echo "  ${SUBMODULE_ADMIN_LAUNCHER}"
    echo "Have you initialized submodules? Run:"
    echo "  git submodule update --init --recursive"
    exit 1
fi

chmod +x "${SUBMODULE_ADMIN_LAUNCHER}"
exec "${SUBMODULE_ADMIN_LAUNCHER}" "$@"
