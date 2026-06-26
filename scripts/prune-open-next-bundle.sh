#!/usr/bin/env bash
set -euo pipefail

ROOT=".open-next/server-functions"

if [[ ! -d "$ROOT" ]]; then
  echo "OpenNext bundle not found at $ROOT"
  exit 1
fi

# Prisma ships multiple query-compiler builds; keep only the small PostgreSQL compiler.
find "$ROOT" -type f -name 'query_compiler_fast_bg*' -delete

# Generated types are not needed at runtime.
find "$ROOT" -type f -path '*/.prisma/client/index.d.ts' -delete

echo "Pruned unused OpenNext server bundle files"
