import type { Resend } from "resend";
import { renderAdminAlertEmail } from "@/emails/templates/admin-alert";
import { renderInquiryReceivedEmail } from "@/emails/templates/inquiry-received";
import { renderInquiryReplyEmail } from "@/emails/templates/inquiry-reply";
import {
  renderOrderConfirmationEmail,
  type OrderLineItem,
} from "@/emails/templates/order-confirmation";
import { renderOrderShippedEmail } from "@/emails/templates/order-shipped";
import { renderPasswordResetEmail } from "@/emails/templates/password-reset";
import { renderReturnRequestedEmail } from "@/emails/templates/return-requested";
import { renderWelcomeEmail } from "@/emails/templates/welcome";
import {
  EMAIL_SENDERS,
  escapeHtml,
  formatMoney,
  formatOrderProductsSubject,
  textToHtml,
  toAbsoluteUrl,
} from "@/emails/theme";
import { getAdminNotificationEmails } from "@/lib/admin-notifications";
import { getWelcomeEmailProductSections } from "@/lib/emails/welcome-products";

let resendClient: Resend | null = null;

async function getResend() {
  if (!resendClient) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error("RESEND_API_KEY is not set");
    }

    const { Resend } = await import("resend");
    resendClient = new Resend(key);
  }
  return resendClient;
}

type SendEmailInput = {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

async function sendEmail({ from, to, subject, html, replyTo }: SendEmailInput) {
  const recipients = Array.isArray(to) ? to : [to];

  if (!process.env.RESEND_API_KEY) {
    console.log(`[email] ${subject} -> ${recipients.join(", ")}`);
    return;
  }

  try {
    const result = await (await getResend()).emails.send({
      from,
      to: recipients,
      subject,
      html,
      replyTo,
    });

    if (result.error) {
      console.error(
        `[email] Failed to send "${subject}" to ${recipients.join(", ")}:`,
        result.error,
      );
    }
  } catch (error) {
    console.error(
      `[email] Failed to send "${subject}" to ${recipients.join(", ")}:`,
      error,
    );
  }
}

async function sendAdminAlert({
  subject,
  title,
  intro,
  details,
  adminPath,
  from = EMAIL_SENDERS.support,
  replyTo,
}: {
  subject: string;
  title: string;
  intro: string;
  details: string;
  adminPath: string;
  from?: string;
  replyTo?: string;
}) {
  const recipients = await getAdminNotificationEmails();
  if (recipients.length === 0) return;

  await sendEmail({
    from,
    to: recipients,
    subject,
    html: renderAdminAlertEmail({
      title,
      intro,
      details,
      cta: {
        label: "Open in admin",
        href: toAbsoluteUrl(adminPath),
      },
    }),
    replyTo,
  });
}

export async function sendWelcomeEmail({
  to,
  name,
}: {
  to: string;
  name: string;
}) {
  const sections = await getWelcomeEmailProductSections();

  await sendEmail({
    from: EMAIL_SENDERS.hello,
    to,
    subject: "Welcome to The Mini Wear",
    html: renderWelcomeEmail({ name, sections }),
  });
}

export async function sendOrderConfirmationEmail({
  to,
  orderNumber,
  total,
  items = [],
}: {
  to: string;
  orderNumber: string;
  total: number | string;
  items?: OrderLineItem[];
}) {
  const numericTotal =
    typeof total === "string" ? parseFloat(total.replace(/[^0-9.-]/g, "")) : total;
  const productLabel = formatOrderProductsSubject(items.map((item) => item.name));

  await sendEmail({
    from: EMAIL_SENDERS.orders,
    to,
    subject: `Order confirmed — ${productLabel}`,
    html: renderOrderConfirmationEmail({
      orderNumber,
      total: numericTotal,
      items,
    }),
    replyTo: "orders@theminiwear.com",
  });
}

export async function sendShippingUpdateEmail({
  to,
  orderNumber,
  productNames,
  trackingNumber,
  carrier,
}: {
  to: string;
  orderNumber: string;
  productNames: string[];
  trackingNumber: string;
  carrier: string;
}) {
  const productLabel = formatOrderProductsSubject(productNames);

  await sendEmail({
    from: EMAIL_SENDERS.orders,
    to,
    subject: `Your order has shipped — ${productLabel}`,
    html: renderOrderShippedEmail({ orderNumber, carrier, trackingNumber }),
    replyTo: "orders@theminiwear.com",
  });
}

export async function sendInquiryReceivedEmail({
  to,
  name,
  subject,
}: {
  to: string;
  name: string;
  subject: string;
}) {
  await sendEmail({
    from: EMAIL_SENDERS.support,
    to,
    subject: `We received your message — ${subject}`,
    html: renderInquiryReceivedEmail({ name, subject }),
    replyTo: "support@theminiwear.com",
  });
}

export async function sendInquiryReplyEmail({
  to,
  subject,
  message,
}: {
  to: string;
  subject: string;
  message: string;
}) {
  await sendEmail({
    from: EMAIL_SENDERS.support,
    to,
    subject: `Re: ${subject}`,
    html: renderInquiryReplyEmail({ subject, message }),
    replyTo: "support@theminiwear.com",
  });
}

export async function sendReturnRequestedEmail({
  to,
  orderNumber,
  productNames,
  reason,
}: {
  to: string;
  orderNumber: string;
  productNames: string[];
  reason: string;
}) {
  const productLabel = formatOrderProductsSubject(productNames);

  await sendEmail({
    from: EMAIL_SENDERS.support,
    to,
    subject: `Return request received — ${productLabel}`,
    html: renderReturnRequestedEmail({ orderNumber, reason }),
    replyTo: "support@theminiwear.com",
  });
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: {
  to: string;
  name: string;
  resetUrl: string;
}) {
  await sendEmail({
    from: EMAIL_SENDERS.support,
    to,
    subject: "Reset your The Mini Wear password",
    html: renderPasswordResetEmail({ name, resetUrl }),
    replyTo: "support@theminiwear.com",
  });
}

export async function sendAdminNewOrderEmail({
  orderId,
  orderNumber,
  customerName,
  customerEmail,
  total,
  itemCount,
}: {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  itemCount: number;
}) {
  await sendAdminAlert({
    from: EMAIL_SENDERS.orders,
    subject: `New order — ${orderNumber}`,
    title: "New order received",
    intro: "A customer just completed checkout on your store.",
    details: `
      <p style="margin: 0 0 10px;"><strong>Order:</strong> ${escapeHtml(orderNumber)}</p>
      <p style="margin: 0 0 10px;"><strong>Customer:</strong> ${escapeHtml(customerName)}</p>
      <p style="margin: 0 0 10px;"><strong>Email:</strong> ${escapeHtml(customerEmail)}</p>
      <p style="margin: 0 0 10px;"><strong>Items:</strong> ${itemCount}</p>
      <p style="margin: 0;"><strong>Total:</strong> ${escapeHtml(formatMoney(total))}</p>
    `,
    adminPath: `/admin/orders/${orderId}`,
    replyTo: customerEmail,
  });
}

export async function sendAdminNewInquiryEmail({
  inquiryId,
  subject,
  customerName,
  customerEmail,
  message,
}: {
  inquiryId: string;
  subject: string;
  customerName: string;
  customerEmail: string;
  message: string;
}) {
  const preview =
    message.length > 280 ? `${message.slice(0, 277).trimEnd()}…` : message;

  await sendAdminAlert({
    subject: `New inquiry — ${subject}`,
    title: "New customer inquiry",
    intro: "Someone submitted the contact form on your storefront.",
    details: `
      <p style="margin: 0 0 10px;"><strong>From:</strong> ${escapeHtml(customerName)}</p>
      <p style="margin: 0 0 10px;"><strong>Email:</strong> ${escapeHtml(customerEmail)}</p>
      <p style="margin: 0 0 10px;"><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <p style="margin: 0;"><strong>Message:</strong><br />${textToHtml(preview)}</p>
    `,
    adminPath: `/admin/inquiries/${inquiryId}`,
    replyTo: customerEmail,
  });
}

export async function sendAdminReturnRequestEmail({
  orderId,
  orderNumber,
  customerEmail,
  reason,
}: {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  reason: string;
}) {
  await sendAdminAlert({
    subject: `Return requested — ${orderNumber}`,
    title: "New return request",
    intro: "A customer submitted a return request that needs your review.",
    details: `
      <p style="margin: 0 0 10px;"><strong>Order:</strong> ${escapeHtml(orderNumber)}</p>
      <p style="margin: 0 0 10px;"><strong>Email:</strong> ${escapeHtml(customerEmail)}</p>
      <p style="margin: 0;"><strong>Reason:</strong><br />${textToHtml(reason)}</p>
    `,
    adminPath: `/admin/orders/${orderId}`,
    replyTo: customerEmail,
  });
}

export async function sendAdminNewReviewEmail({
  reviewId,
  productName,
  reviewerName,
  rating,
  title,
  body,
}: {
  reviewId: string;
  productName: string;
  reviewerName: string;
  rating: number;
  title: string | null;
  body: string;
}) {
  const preview = body.length > 220 ? `${body.slice(0, 217).trimEnd()}…` : body;

  await sendAdminAlert({
    subject: `New review — ${productName}`,
    title: "New product review",
    intro: "A customer left a review that is waiting for moderation.",
    details: `
      <p style="margin: 0 0 10px;"><strong>Product:</strong> ${escapeHtml(productName)}</p>
      <p style="margin: 0 0 10px;"><strong>Customer:</strong> ${escapeHtml(reviewerName)}</p>
      <p style="margin: 0 0 10px;"><strong>Rating:</strong> ${rating}/5</p>
      ${title ? `<p style="margin: 0 0 10px;"><strong>Title:</strong> ${escapeHtml(title)}</p>` : ""}
      <p style="margin: 0;"><strong>Review:</strong><br />${textToHtml(preview)}</p>
    `,
    adminPath: `/admin/reviews/${reviewId}`,
  });
}

export async function sendAdminNewsletterSignupEmail({ email }: { email: string }) {
  await sendAdminAlert({
    from: EMAIL_SENDERS.hello,
    subject: `New newsletter subscriber`,
    title: "New newsletter signup",
    intro: "Someone joined your email list from the storefront.",
    details: `
      <p style="margin: 0;"><strong>Email:</strong> ${escapeHtml(email)}</p>
    `,
    adminPath: "/admin/newsletter",
    replyTo: email,
  });
}

export async function sendAdminNewAccountEmail({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  await sendAdminAlert({
    from: EMAIL_SENDERS.hello,
    subject: `New account — ${name}`,
    title: "New customer account",
    intro: "Someone created a store account on your website.",
    details: `
      <p style="margin: 0 0 10px;"><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p style="margin: 0;"><strong>Email:</strong> ${escapeHtml(email)}</p>
    `,
    adminPath: "/admin/customers",
    replyTo: email,
  });
}

export async function sendAdminInquiryReplyEmail({
  inquiryId,
  subject,
  customerName,
  customerEmail,
  message,
}: {
  inquiryId: string;
  subject: string;
  customerName: string;
  customerEmail: string;
  message: string;
}) {
  const preview =
    message.length > 280 ? `${message.slice(0, 277).trimEnd()}…` : message;

  await sendAdminAlert({
    subject: `Inquiry reply — ${subject}`,
    title: "Customer replied to inquiry",
    intro: "A customer added a new message to an existing support thread.",
    details: `
      <p style="margin: 0 0 10px;"><strong>From:</strong> ${escapeHtml(customerName)}</p>
      <p style="margin: 0 0 10px;"><strong>Email:</strong> ${escapeHtml(customerEmail)}</p>
      <p style="margin: 0 0 10px;"><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <p style="margin: 0;"><strong>Message:</strong><br />${textToHtml(preview)}</p>
    `,
    adminPath: `/admin/inquiries/${inquiryId}`,
    replyTo: customerEmail,
  });
}

type LowStockEmailVariant = {
  productName: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
  previousStock?: number;
};

export async function sendAdminLowStockEmail({
  variants,
  orderNumber,
}: {
  variants: LowStockEmailVariant[];
  orderNumber?: string;
}) {
  if (variants.length === 0) return;

  const rows = variants
    .map((variant) => {
      const status =
        variant.stock <= 0
          ? "Out of stock"
          : `Low stock (${variant.stock} left)`;
      const change =
        variant.previousStock != null
          ? `Was ${variant.previousStock} → now ${variant.stock}`
          : `${variant.stock} in stock`;

      return `<p style="margin: 0 0 12px;">
        <strong>${escapeHtml(variant.productName)}</strong><br />
        ${escapeHtml(variant.size)} / ${escapeHtml(variant.color)} · SKU ${escapeHtml(variant.sku)}<br />
        ${escapeHtml(status)} · ${escapeHtml(change)}
      </p>`;
    })
    .join("");

  const intro = orderNumber
    ? `Inventory dropped after order ${orderNumber}.`
    : "These variants are at or below your low-stock threshold.";

  await sendAdminAlert({
    from: EMAIL_SENDERS.orders,
    subject: orderNumber
      ? `Low stock after order — ${orderNumber}`
      : `Low stock report — ${variants.length} variant(s)`,
    title: orderNumber ? "Low stock after order" : "Daily low stock report",
    intro,
    details: rows,
    adminPath: "/admin/products",
  });
}

export async function sendAdminCheckoutIssueEmail({
  type,
  customerEmail,
  itemSummary,
  totalLabel,
  failureMessage,
  stripeSessionId,
}: {
  type: "payment_failed" | "abandoned";
  customerEmail: string;
  itemSummary: string;
  totalLabel: string;
  failureMessage?: string;
  stripeSessionId: string;
}) {
  const isFailed = type === "payment_failed";
  const title = isFailed ? "Checkout payment failed" : "Checkout abandoned";
  const intro = isFailed
    ? "A customer attempted checkout but the payment did not go through."
    : "A customer started checkout but did not complete payment before the session expired.";

  const failureBlock = failureMessage
    ? `<p style="margin: 0 0 10px;"><strong>Reason:</strong> ${escapeHtml(failureMessage)}</p>`
    : "";

  await sendAdminAlert({
    from: EMAIL_SENDERS.orders,
    subject: isFailed
      ? `Payment failed — ${customerEmail}`
      : `Abandoned checkout — ${customerEmail}`,
    title,
    intro,
    details: `
      <p style="margin: 0 0 10px;"><strong>Email:</strong> ${escapeHtml(customerEmail)}</p>
      <p style="margin: 0 0 10px;"><strong>Cart:</strong> ${escapeHtml(itemSummary)}</p>
      <p style="margin: 0 0 10px;"><strong>Amount:</strong> ${escapeHtml(totalLabel)}</p>
      ${failureBlock}
      <p style="margin: 0;"><strong>Stripe reference:</strong> ${escapeHtml(stripeSessionId)}</p>
    `,
    adminPath: "/admin/orders",
    replyTo: customerEmail.includes("@") ? customerEmail : undefined,
  });
}
