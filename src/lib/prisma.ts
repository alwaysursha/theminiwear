import { cache } from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

type HyperdriveBinding = {
  connectionString: string;
};

type CloudflareBindings = {
  DATABASE_URL?: string;
  HYPERDRIVE?: HyperdriveBinding;
};

function readDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  try {
    const { env } = getCloudflareContext();
    const bindings = env as typeof env & CloudflareBindings;
    if (typeof bindings.DATABASE_URL === "string" && bindings.DATABASE_URL) {
      return bindings.DATABASE_URL;
    }
    if (bindings.HYPERDRIVE?.connectionString) {
      return bindings.HYPERDRIVE.connectionString;
    }
  } catch {
    // Outside Cloudflare runtime (local build, tests, etc.)
  }

  return undefined;
}

function createPrismaClient() {
  const connectionString = readDatabaseUrl();

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

const getPrismaClient = cache(createPrismaClient);

export function getPrisma() {
  return getPrismaClient();
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
