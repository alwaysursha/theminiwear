import { SITE_NAME } from "@/lib/constants";

export const EMAIL_COLORS = {
  background: "#fffaf9",
  foreground: "#1e2a4a",
  blush: "#fde8e8",
  mint: "#c8f0e0",
  coral: "#ff7f6e",
  navy: "#1e2a4a",
  muted: "#5a6478",
} as const;

export const EMAIL_SENDERS = {
  hello: `The Mini Wear <hello@theminiwear.com>`,
  orders: `The Mini Wear <orders@theminiwear.com>`,
  support: `The Mini Wear <support@theminiwear.com>`,
} as const;

export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXTAUTH_URL ??
    "https://theminiwear.com"
  ).replace(/\/$/, "");
}

export function getSiteName() {
  return SITE_NAME;
}

export function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function textToHtml(text: string) {
  return escapeHtml(text).replace(/\n/g, "<br />");
}

export function formatMoney(amount: number | string) {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}
