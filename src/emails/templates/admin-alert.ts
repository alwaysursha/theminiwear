import { renderEmailLayout } from "@/emails/layout";
import { EMAIL_COLORS, escapeHtml } from "@/emails/theme";

export function renderAdminAlertEmail({
  title,
  intro,
  details,
  cta,
}: {
  title: string;
  intro: string;
  details: string;
  cta: { label: string; href: string };
}) {
  return renderEmailLayout({
    preview: intro,
    title,
    body: `
      <p style="margin: 0 0 16px;">${escapeHtml(intro)}</p>
      <div style="margin: 0; padding: 16px 18px; border-radius: 16px; background: rgba(30, 42, 74, 0.04); border: 1px solid rgba(30, 42, 74, 0.08); color: ${EMAIL_COLORS.navy}; font-size: 14px; line-height: 1.6;">
        ${details}
      </div>
    `,
    cta,
    footerNote: "Admin notification from The Mini Wear.",
  });
}
