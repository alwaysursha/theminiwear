import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import {
  notifyAdminPaymentIntentFailed,
} from "@/lib/checkout-admin-alerts";
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail, sendAdminLowStockEmail } from "@/lib/email";
import { clearUserCartById } from "@/lib/actions/cart";
import { findVariantsCrossedLowStock } from "@/lib/low-stock";
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
      customFee?: number;
      measurements?: Record<string, string>;
    }>;

    const variantIds = [...new Set(items.map((item) => item.variantId))];
    const stockBeforeRows = variantIds.length
      ? await prisma.productVariant.findMany({
          where: { id: { in: variantIds } },
          select: {
            id: true,
            stock: true,
            size: true,
            color: true,
            product: { select: { name: true } },
          },
        })
      : [];
    const stockBefore = new Map(
      stockBeforeRows.map((variant) => [variant.id, variant.stock]),
    );
    const variantMeta = new Map(
      stockBeforeRows.map((variant) => [
        variant.id,
        {
          productName: variant.product.name,
          variantLabel: `${variant.size} / ${variant.color}`,
        },
      ]),
    );

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
          create: items.map((item) => {
            const meta = variantMeta.get(item.variantId);
            return {
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
              customFee: item.customFee ?? null,
              customMeasurements: item.measurements ?? undefined,
              productName: meta?.productName ?? null,
              variantLabel: meta?.variantLabel ?? null,
            };
          }),
        },
        statusHistory: {
          create: { status: "PAID", note: "Payment received via Stripe" },
        },
      },
      include: {
        user: true,
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
      },
    });

    for (const item of items) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    const lowStockVariants = await findVariantsCrossedLowStock(items, stockBefore);
    if (lowStockVariants.length > 0) {
      await sendAdminLowStockEmail({
        orderNumber: order.orderNumber,
        variants: lowStockVariants.map((variant) => ({
          productName: variant.productName,
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          stock: variant.stock,
          previousStock: variant.previousStock,
        })),
      });
    }

    if (metadata.userId) {
      await clearUserCartById(metadata.userId);
    }

    const email = order.user?.email ?? order.guestEmail;
    if (email) {
      await sendOrderConfirmationEmail({
        to: email,
        orderNumber: order.orderNumber,
        total: Number(order.total),
        items: order.items.map((item) => ({
          name: item.variant?.product.name ?? item.productName ?? "Product",
          quantity: item.quantity,
          price: Number(item.price),
          size: item.variant?.size ?? item.variantLabel?.split(" / ")[0] ?? "",
          color: item.variant?.color ?? item.variantLabel?.split(" / ")[1] ?? "",
        })),
      });
    }

    await sendAdminNewOrderEmail({
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.user?.name ?? "Guest",
      customerEmail: email ?? "No email on file",
      total: Number(order.total),
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    });
  }

  if (event.type === "checkout.session.expired") {
    // Abandoned-checkout admin emails are disabled.
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    await notifyAdminPaymentIntentFailed(paymentIntent);
  }

  return NextResponse.json({ received: true });
}
