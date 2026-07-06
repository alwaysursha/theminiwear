import { renderEmailLayout } from "@/emails/layout";
import { EMAIL_COLORS, escapeHtml, getSiteUrl, toAbsoluteUrl } from "@/emails/theme";

export function renderPasswordResetEmail({
  name,
  resetUrl,
}: {
  name: string;
  resetUrl: string;
}) {
  const firstName = name.trim().split(/\s+/)[0] || "there";

  return renderEmailLayout({
    preview: "Reset your The Mini Wear password",
    title: "Reset your password",
    body: `
      <p style="margin: 0 0 14px; font-size: 16px; line-height: 1.7;">
        Hi ${escapeHtml(firstName)}, we received a request to reset the password for your
        <strong>The Mini Wear</strong> account.
      </p>
      <p style="margin: 0 0 14px; font-size: 15px; line-height: 1.7; color: ${EMAIL_COLORS.muted};">
        Click the button below to choose a new password. This link expires in
        <strong>1 hour</strong> and can only be used once.
      </p>
      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: ${EMAIL_COLORS.muted};">
        If you did not request this, you can safely ignore this email. Your password will not change.
      </p>
    `,
    cta: {
      label: "Reset password",
      href: resetUrl,
    },
    footerNote: `Or copy this link into your browser: ${resetUrl}`,
  });
}

export function buildPasswordResetUrl(token: string) {
  return toAbsoluteUrl(`/auth/reset-password?token=${encodeURIComponent(token)}`, getSiteUrl());
}
