import { renderEmailLayout } from "@/emails/layout";
import { EMAIL_COLORS, escapeHtml, getSiteUrl } from "@/emails/theme";

export function renderOrderShippedEmail({
  orderNumber,
  carrier,
  trackingNumber,
}: {
  orderNumber: string;
  carrier: string;
  trackingNumber: string;
}) {
  return renderEmailLayout({
    preview: `Your order ${orderNumber} is on the way.`,
    title: "Your order has shipped",
    body: `
      <p style="margin: 0 0 16px;">Good news — order <strong>${escapeHtml(orderNumber)}</strong> is on its way.</p>
      <table role="presentation" cellspacing="0" cellpadding="0" style="width: 100%; background: ${EMAIL_COLORS.blush}; border-radius: 14px; padding: 16px 18px;">
        <tr>
          <td style="font-size: 14px; color: ${EMAIL_COLORS.muted}; padding-bottom: 6px;">Carrier</td>
        </tr>
        <tr>
          <td style="font-size: 16px; font-weight: 700; color: ${EMAIL_COLORS.navy}; padding-bottom: 14px;">${escapeHtml(carrier)}</td>
        </tr>
        <tr>
          <td style="font-size: 14px; color: ${EMAIL_COLORS.muted}; padding-bottom: 6px;">Tracking number</td>
        </tr>
        <tr>
          <td style="font-size: 16px; font-weight: 700; color: ${EMAIL_COLORS.navy};">${escapeHtml(trackingNumber)}</td>
        </tr>
      </table>
    `,
    cta: {
      label: "Track your order",
      href: `${getSiteUrl()}/account/orders`,
    },
  });
}
