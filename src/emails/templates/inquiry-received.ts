import { renderEmailLayout } from "@/emails/layout";
import { EMAIL_COLORS, escapeHtml, getSiteUrl } from "@/emails/theme";

export function renderInquiryReceivedEmail({
  name,
  subject,
}: {
  name: string;
  subject: string;
}) {
  const firstName = name.trim().split(/\s+/)[0] || "there";

  return renderEmailLayout({
    preview: "We received your message and will reply soon.",
    title: "We got your message",
    body: `
      <p style="margin: 0 0 16px;">Hi ${escapeHtml(firstName)},</p>
      <p style="margin: 0 0 16px;">Thanks for reaching out to The Mini Wear. We received your inquiry about <strong>${escapeHtml(subject)}</strong>.</p>
      <p style="margin: 0; color: ${EMAIL_COLORS.muted};">Our team typically replies within 1–2 business days. If your question is urgent, you can reply to this email.</p>
    `,
    cta: {
      label: "Visit our shop",
      href: `${getSiteUrl()}/shop`,
    },
    footerNote: "This is an automated confirmation. A team member will follow up personally.",
  });
}
