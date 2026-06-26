import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function getHyperdriveConnectionString() {
  try {
    const { env } = getCloudflareContext();
    const hyperdrive = env.HYPERDRIVE as { connectionString?: string } | undefined;
    return hyperdrive?.connectionString ?? null;
  } catch {
    return null;
  }
}

function createPrismaClient() {
  const hyperdriveUrl = getHyperdriveConnectionString();
  const connectionString = hyperdriveUrl ?? process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  if (hyperdriveUrl) {
    const adapter = new PrismaPg({ connectionString, maxUses: 1 });
    return new PrismaClient({ adapter });
  }

  const pool = globalForPrisma.pool ?? new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const client = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
    globalForPrisma.prisma = client;
  }

  return client;
}

export function getPrisma() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Lazy proxy so build-time imports don't require DATABASE_URL
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    const value = client[prop as keyof PrismaClient];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
