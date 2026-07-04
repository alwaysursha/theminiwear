import { renderEmailLayout } from "@/emails/layout";
import { EMAIL_COLORS, escapeHtml, formatMoney, getSiteUrl } from "@/emails/theme";

export type OrderLineItem = {
  name: string;
  quantity: number;
  price: number;
  size?: string | null;
  color?: string | null;
};

export function renderOrderConfirmationEmail({
  orderNumber,
  total,
  items,
}: {
  orderNumber: string;
  total: number;
  items: OrderLineItem[];
}) {
  const rows = items
    .map((item) => {
      const details = [item.size, item.color].filter(Boolean).join(" · ");
      const meta = details
        ? `<div style="font-size: 13px; color: ${EMAIL_COLORS.muted}; margin-top: 4px;">${escapeHtml(details)}</div>`
        : "";

      return `<tr>
        <td style="padding: 12px 0; border-bottom: 1px solid rgba(30, 42, 74, 0.08);">
          <div style="font-weight: 600; color: ${EMAIL_COLORS.navy};">${escapeHtml(item.name)}</div>
          ${meta}
          <div style="font-size: 13px; color: ${EMAIL_COLORS.muted}; margin-top: 4px;">Qty ${item.quantity}</div>
        </td>
        <td align="right" style="padding: 12px 0; border-bottom: 1px solid rgba(30, 42, 74, 0.08); white-space: nowrap; color: ${EMAIL_COLORS.navy}; font-weight: 600;">
          ${escapeHtml(formatMoney(item.price * item.quantity))}
        </td>
      </tr>`;
    })
    .join("");

  const itemsTable =
    items.length > 0
      ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0 8px;">
          ${rows}
          <tr>
            <td style="padding-top: 16px; font-weight: 700; color: ${EMAIL_COLORS.navy};">Total</td>
            <td align="right" style="padding-top: 16px; font-weight: 700; color: ${EMAIL_COLORS.coral}; font-size: 18px;">${escapeHtml(formatMoney(total))}</td>
          </tr>
        </table>`
      : `<p style="margin: 16px 0 0; font-weight: 700; color: ${EMAIL_COLORS.coral}; font-size: 18px;">Total: ${escapeHtml(formatMoney(total))}</p>`;

  return renderEmailLayout({
    preview: `Your order ${orderNumber} is confirmed.`,
    title: "Order confirmed",
    body: `
      <p style="margin: 0 0 12px;">Thank you for your order. We are getting everything ready for you.</p>
      <p style="margin: 0 0 4px;"><strong>Order number:</strong> ${escapeHtml(orderNumber)}</p>
      ${itemsTable}
      <p style="margin: 16px 0 0; font-size: 14px; color: ${EMAIL_COLORS.muted};">We will email you again when your order ships.</p>
    `,
    cta: {
      label: "View order",
      href: `${getSiteUrl()}/account/orders`,
    },
  });
}
