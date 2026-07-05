-- Safe migration for existing CartItem rows before lineId becomes required.
-- Run: pnpm exec prisma db execute --file prisma/scripts/backfill-cart-line-id.sql

ALTER TABLE "CartItem" ADD COLUMN IF NOT EXISTS "lineId" TEXT;
ALTER TABLE "CartItem" ADD COLUMN IF NOT EXISTS "customFee" DECIMAL(10,2);
ALTER TABLE "CartItem" ADD COLUMN IF NOT EXISTS "customMeasurements" JSONB;

UPDATE "CartItem" SET "lineId" = "variantId" WHERE "lineId" IS NULL;

ALTER TABLE "CartItem" ALTER COLUMN "lineId" SET NOT NULL;

ALTER TABLE "CartItem" DROP CONSTRAINT IF EXISTS "CartItem_cartId_variantId_key";

CREATE UNIQUE INDEX IF NOT EXISTS "CartItem_cartId_lineId_key" ON "CartItem"("cartId", "lineId");

CREATE INDEX IF NOT EXISTS "CartItem_cartId_idx" ON "CartItem"("cartId");

ALTER TABLE "Cart" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
