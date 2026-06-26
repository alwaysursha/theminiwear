import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { generateOrderNumber } from "@/lib/utils";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = await getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata ?? {};

    const existing = await prisma.order.findUnique({
      where: { stripeSessionId: session.id },
    });

    if (existing) {
      return NextResponse.json({ received: true });
    }

    const items = JSON.parse(metadata.items ?? "[]") as Array<{
      variantId: string;
      quantity: number;
      price: number;
    }>;

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: metadata.userId || null,
        guestEmail: session.customer_email,
        status: "PAID",
        subtotal: parseFloat(metadata.subtotal ?? "0"),
        shippingCost: parseFloat(metadata.shippingCost ?? "0"),
        discountAmount: parseFloat(metadata.discountAmount ?? "0"),
        taxAmount: parseFloat(metadata.taxAmount ?? "0"),
        total: (session.amount_total ?? 0) / 100,
        stripeSessionId: session.id,
        stripePaymentId: session.payment_intent as string,
        discountId: metadata.discountId || null,
        addressId: metadata.addressId || null,
        items: {
          create: items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        statusHistory: {
          create: { status: "PAID", note: "Payment received via Stripe" },
        },
      },
      include: { user: true },
    });

    for (const item of items) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    const email = order.user?.email ?? order.guestEmail;
    if (email) {
      await sendOrderConfirmationEmail({
        to: email,
        orderNumber: order.orderNumber,
        total: `$${order.total}`,
      });
    }
  }

  return NextResponse.json({ received: true });
}
