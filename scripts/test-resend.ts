import { readFileSync } from "fs";
import { resolve } from "path";

function loadDevVars() {
  const path = resolve(process.cwd(), ".dev.vars");
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

async function main() {
  loadDevVars();

  const to = process.argv[2] ?? "Omsyed88@gmail.com";
  const key = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL ?? "The Mini Wear <orders@theminiwear.com>";

  if (!key || key.includes("REPLACE")) {
    console.error("RESEND_API_KEY is missing or still the placeholder in .dev.vars");
    process.exit(1);
  }

  const { Resend } = await import("resend");
  const resend = new Resend(key);

  const result = await resend.emails.send({
    from,
    to,
    subject: "The Mini Wear — Resend test",
    html: `<p>If you got this, Resend is configured correctly.</p><p>From: ${from}</p>`,
  });

  if (result.error) {
    console.error("Send failed:", result.error);
    process.exit(1);
  }

  console.log(`Test email sent to ${to} (id: ${result.data?.id})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
