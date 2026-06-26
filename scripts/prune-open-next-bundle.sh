#!/usr/bin/env bash
set -euo pipefail

ROOT=".open-next/server-functions"

if [[ ! -d "$ROOT" ]]; then
  echo "OpenNext bundle not found at $ROOT"
  exit 1
fi

echo "Pruning OpenNext server bundle..."

# Prisma ships compilers for every database; keep PostgreSQL only.
find "$ROOT" -type f -name 'query_compiler_fast_bg*' -delete
find "$ROOT" -type f -name 'query_compiler_small_bg.mysql*' -delete
find "$ROOT" -type f -name 'query_compiler_small_bg.sqlite*' -delete
find "$ROOT" -type f -name 'query_compiler_small_bg.sqlserver*' -delete
find "$ROOT" -type f -name 'query_compiler_small_bg.cockroachdb*' -delete

# Drop embedded base64 wasm copies when the binary wasm is present.
find "$ROOT" -type f -name '*wasm-base64*' -delete

# Generated types and browser/edge entrypoints are not needed at runtime.
find "$ROOT" -type f -path '*/.prisma/client/index.d.ts' -delete
find "$ROOT" -type f -path '*/.prisma/client/index-browser.js' -delete
find "$ROOT" -type f -path '*/.prisma/client/edge.js' -delete
find "$ROOT" -type f -path '*/.prisma/client/schema.prisma' -delete

while IFS= read -r -d '' dir; do
  rm -rf "$dir"
done < <(find "$ROOT" -type d -path '*/@prisma/client/generator-build' -print0 2>/dev/null || true)

while IFS= read -r -d '' dir; do
  rm -rf "$dir"
done < <(find "$ROOT" -type d -path '*/@prisma/client/scripts' -print0 2>/dev/null || true)

# Source maps and type declarations add weight without helping production.
find "$ROOT" -type f -name '*.map' -delete
find "$ROOT" -type f -name '*.d.ts' -delete
find "$ROOT" -type f -name '*.d.mts' -delete

# pg is not used in the Worker runtime (Neon adapter only).
while IFS= read -r -d '' dir; do
  rm -rf "$dir"
done < <(find "$ROOT" -type d -name 'pg' -path '*/node_modules/pg' -print0 2>/dev/null || true)

while IFS= read -r -d '' dir; do
  rm -rf "$dir"
done < <(find "$ROOT" -type d -name 'pg-cloudflare' -path '*/node_modules/pg-cloudflare' -print0 2>/dev/null || true)

while IFS= read -r -d '' dir; do
  rm -rf "$dir"
done < <(find "$ROOT" -type d -path '*/node_modules/@prisma/adapter-pg' -print0 2>/dev/null || true)

echo "Pruned unused OpenNext server bundle files"
