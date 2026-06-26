#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "→ Stopping dev servers on ports 3000–3003..."
for p in 3000 3001 3002 3003; do
  lsof -ti :"$p" | xargs kill -9 2>/dev/null || true
done
sleep 2

still_running=false
for p in 3000 3001 3002 3003; do
  if lsof -ti :"$p" >/dev/null 2>&1; then
    echo "⚠ Port $p is still in use. Run this manually:"
    echo "  lsof -ti :$p | xargs kill -9"
    still_running=true
  fi
done

if [ "$still_running" = true ]; then
  echo ""
  echo "Close other Cursor/terminal dev tabs, then re-run: pnpm dev:clean"
  exit 1
fi

echo "→ Clearing Next.js cache..."
rm -rf .next

exec bash scripts/dev.sh
