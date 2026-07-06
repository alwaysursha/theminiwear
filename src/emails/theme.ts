import { SITE_NAME } from "@/lib/constants";
export { formatMoney } from "@/lib/currency";

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

export function toAbsoluteUrl(path: string, siteUrl = getSiteUrl()) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getEmailLogoUrl() {
  return toAbsoluteUrl("/logo.png");
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

/** Short product label for customer email subjects (e.g. one item or "Dress & 2 more"). */
export function formatOrderProductsSubject(productNames: string[]): string {
  const names = [...new Set(productNames.map((name) => name.trim()).filter(Boolean))];
  if (names.length === 0) return "your order";
  if (names.length === 1) return names[0]!;
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names[0]} and ${names.length - 1} more`;
}
