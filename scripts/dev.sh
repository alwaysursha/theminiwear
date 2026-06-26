#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 22 >/dev/null

ulimit -n 10240 2>/dev/null || true

for p in 3000 3001 3002 3003; do
  lsof -ti :"$p" | xargs kill -9 2>/dev/null || true
done
sleep 2

rm -rf .next

echo "→ Starting local database..."
if ! pnpm exec prisma dev start theminiwear -d 2>/dev/null; then
  echo "  Prisma dev unavailable — using Homebrew PostgreSQL on :5432"
  psql -h localhost -p 5432 -d postgres -c "CREATE DATABASE theminiwear;" 2>/dev/null || true
fi
sleep 2

echo "→ Syncing schema..."
if pnpm db:push; then
  echo "→ Seeding sample data..."
  node --import tsx prisma/seed.ts 2>/dev/null || true
else
  echo "⚠ Database not reachable. Run: pnpm dev:db"
  echo "  Then: pnpm db:push && pnpm db:seed"
fi

echo ""
echo "→ Starting Next.js at http://127.0.0.1:3000"
echo "  All accounts use password: password123"
echo "  Admin: admin@theminiwear.com"
echo ""

for p in 3000 3001 3002 3003; do
  lsof -ti :"$p" | xargs kill -9 2>/dev/null || true
done
sleep 1

export WATCHPACK_POLLING=true
exec pnpm exec next dev --hostname 127.0.0.1 --webpack
