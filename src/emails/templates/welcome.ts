import { renderEmailLayout } from "@/emails/layout";
import { escapeHtml, getSiteUrl } from "@/emails/theme";

export function renderWelcomeEmail({ name }: { name: string }) {
  const firstName = name.trim().split(/\s+/)[0] || "there";

  return renderEmailLayout({
    preview: `Welcome to The Mini Wear, ${firstName}!`,
    title: `Welcome, ${escapeHtml(firstName)}!`,
    body: `
      <p style="margin: 0 0 16px;">Thanks for joining The Mini Wear. Your account is ready.</p>
      <p style="margin: 0;">Browse our latest drops, save favorites to your wishlist, and track orders from your account dashboard.</p>
    `,
    cta: {
      label: "Start shopping",
      href: `${getSiteUrl()}/shop`,
    },
    footerNote: "You're receiving this because you created an account at The Mini Wear.",
  });
}
