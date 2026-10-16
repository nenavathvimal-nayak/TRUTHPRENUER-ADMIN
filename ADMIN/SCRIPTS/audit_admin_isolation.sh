#!/usr/bin/env bash
set -euo pipefail

echo "=================================================================="
echo "  TRUTHPRENUER ADMIN CONSOLE ISOLATION AUDIT"
echo "=================================================================="

# 1. Verify loopback reachability
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:60135/ || echo "FAIL")
if [ "$STATUS" == "200" ]; then
  echo "  [OK] Admin Panel is responding 200 OK on http://127.0.0.1:60135"
else
  echo "  [FAIL] Admin Panel returned status: $STATUS"
  exit 1
fi

# 2. Verify Vite binding in config
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
if grep -q "host: '127.0.0.1'" "${ROOT_DIR}/ADMIN/vite.config.ts"; then
  echo "  [OK] ADMIN/vite.config.ts strictly binds 127.0.0.1"
else
  echo "  [FAIL] Vite config does not specify host 127.0.0.1"
  exit 1
fi

echo "=================================================================="
echo "  ADMIN ISOLATION AUDIT: PASSED"
echo "=================================================================="
