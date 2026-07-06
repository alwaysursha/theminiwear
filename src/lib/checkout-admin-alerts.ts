import type Stripe from "stripe";
import { formatMoney } from "@/emails/theme";
import { sendAdminCheckoutIssueEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

type CheckoutItem = {
  variantId: string;
  quantity: number;
  price: number;
};

function parseCheckoutItems(metadata: Stripe.Metadata | null | undefined) {
  try {
    const raw = metadata?.items;
    if (!raw) return [] as CheckoutItem[];
    const parsed = JSON.parse(raw) as CheckoutItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as CheckoutItem[];
  }
}

function summarizeCheckout(metadata: Stripe.Metadata | null | undefined, amountTotalCents?: number | null) {
  const items = parseCheckoutItems(metadata);
  const subtotal = Number(metadata?.subtotal ?? 0);
  const total =
    amountTotalCents != null ? amountTotalCents / 100 : subtotal + Number(metadata?.shippingCost ?? 0);

  const itemSummary =
    items.length > 0
      ? `${items.reduce((sum, item) => sum + item.quantity, 0)} item(s)`
      : "Checkout items unavailable";

  return {
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    itemSummary,
    totalLabel: formatMoney(Number.isFinite(total) ? total : 0),
  };
}

export async function notifyAdminCheckoutSessionIssue(
  type: "payment_failed" | "abandoned",
  session: Stripe.Checkout.Session,
  failureMessage?: string,
) {
  const existing = await hasCompletedOrder(session.id);
  if (existing) return;

  const { itemSummary, totalLabel } = summarizeCheckout(
    session.metadata,
    session.amount_total,
  );

  void sendAdminCheckoutIssueEmail({
    type,
    customerEmail: session.customer_email ?? session.customer_details?.email ?? "Unknown",
    itemSummary,
    totalLabel,
    failureMessage,
    stripeSessionId: session.id,
  });
}

export async function notifyAdminPaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent,
) {
  const stripe = await getStripe();
  const sessions = await stripe.checkout.sessions.list({
    payment_intent: paymentIntent.id,
    limit: 1,
  });

  const session = sessions.data[0];
  if (session) {
    await notifyAdminCheckoutSessionIssue(
      "payment_failed",
      session,
      paymentIntent.last_payment_error?.message,
    );
    return;
  }

  const amount = (paymentIntent.amount ?? 0) / 100;
  void sendAdminCheckoutIssueEmail({
    type: "payment_failed",
    customerEmail: paymentIntent.receipt_email ?? "Unknown",
    itemSummary: "Checkout session not found",
    totalLabel: formatMoney(amount),
    failureMessage: paymentIntent.last_payment_error?.message,
    stripeSessionId: paymentIntent.id,
  });
}

async function hasCompletedOrder(stripeSessionId: string) {
  const order = await prisma.order.findUnique({
    where: { stripeSessionId },
    select: { id: true },
  });
  return Boolean(order);
}
