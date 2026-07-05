import { getCloudflareContext } from "@opennextjs/cloudflare";

export function readCloudflareSecret(name: string): string | undefined {
  const fromProcess = process.env[name];
  if (typeof fromProcess === "string" && fromProcess.length > 0) {
    return fromProcess;
  }

  try {
    const { env } = getCloudflareContext();
    const value = (env as Record<string, unknown>)[name];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  } catch {
    // Outside Cloudflare runtime (local build, tests, etc.)
  }

  return undefined;
}
