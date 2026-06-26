import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResend() {
  if (!resendClient) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error("RESEND_API_KEY is not set");
    }
    resendClient = new Resend(key);
  }
  return resendClient;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

export async function sendOrderConfirmationEmail({
  to,
  orderNumber,
  total,
}: {
  to: string;
  orderNumber: string;
  total: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[email] Order confirmation to ${to}: ${orderNumber} - ${total}`);
    return;
  }

  await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Order Confirmed - ${orderNumber}`,
    html: `<h1>Thank you for your order!</h1><p>Order <strong>${orderNumber}</strong> has been confirmed.</p><p>Total: ${total}</p>`,
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
  if (!process.env.RESEND_API_KEY) {
    console.log(`[email] Shipping update to ${to}: ${orderNumber}`);
    return;
  }

  await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your order has shipped - ${orderNumber}`,
    html: `<h1>Your order is on the way!</h1><p>Order <strong>${orderNumber}</strong> shipped via ${carrier}.</p><p>Tracking: <strong>${trackingNumber}</strong></p>`,
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
  if (!process.env.RESEND_API_KEY) {
    console.log(`[email] Inquiry reply to ${to}: ${subject}`);
    return;
  }

  await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Re: ${subject}`,
    html: `<p>${message}</p>`,
  });
}
