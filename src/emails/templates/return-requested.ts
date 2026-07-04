import { renderEmailLayout } from "@/emails/layout";
import { EMAIL_COLORS, escapeHtml, getSiteUrl, textToHtml } from "@/emails/theme";

export function renderReturnRequestedEmail({
  orderNumber,
  reason,
}: {
  orderNumber: string;
  reason: string;
}) {
  return renderEmailLayout({
    preview: `We received your return request for order ${orderNumber}.`,
    title: "Return request received",
    body: `
      <p style="margin: 0 0 16px;">We received your return request for order <strong>${escapeHtml(orderNumber)}</strong>.</p>
      <p style="margin: 0 0 8px; font-size: 14px; color: ${EMAIL_COLORS.muted};">Your reason:</p>
      <div style="background: ${EMAIL_COLORS.blush}; border-radius: 14px; padding: 16px 18px; margin-bottom: 16px;">${textToHtml(reason)}</div>
      <p style="margin: 0; color: ${EMAIL_COLORS.muted};">We will review your request and email you within 2 business days with next steps.</p>
    `,
    cta: {
      label: "View order",
      href: `${getSiteUrl()}/account/orders`,
    },
  });
}
