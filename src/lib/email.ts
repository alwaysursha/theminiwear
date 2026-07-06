import type { Resend } from "resend";
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
import { EMAIL_SENDERS } from "@/emails/theme";
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
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

async function sendEmail({ from, to, subject, html, replyTo }: SendEmailInput) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[email] ${subject} -> ${to}`);
    return;
  }

  try {
    const result = await (await getResend()).emails.send({
      from,
      to,
      subject,
      html,
      replyTo,
    });

    if (result.error) {
      console.error(`[email] Failed to send "${subject}" to ${to}:`, result.error);
    }
  } catch (error) {
    console.error(`[email] Failed to send "${subject}" to ${to}:`, error);
  }
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

  await sendEmail({
    from: EMAIL_SENDERS.orders,
    to,
    subject: `Order confirmed — ${orderNumber}`,
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
  trackingNumber,
  carrier,
}: {
  to: string;
  orderNumber: string;
  trackingNumber: string;
  carrier: string;
}) {
  await sendEmail({
    from: EMAIL_SENDERS.orders,
    to,
    subject: `Your order has shipped — ${orderNumber}`,
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
  reason,
}: {
  to: string;
  orderNumber: string;
  reason: string;
}) {
  await sendEmail({
    from: EMAIL_SENDERS.support,
    to,
    subject: `Return request received — ${orderNumber}`,
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
