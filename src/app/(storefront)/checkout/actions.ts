"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { z } from "zod";

const checkoutInputSchema = z.object({
  items: z.array(
    z.object({
      variantId: z.string(),
      quantity: z.number().min(1),
    }),
  ),
  addressId: z.string().optional(),
  guestEmail: z.string().email().optional(),
  shippingCost: z.number().min(0),
  discountCode: z.string().optional(),
  shippingAddress: z
    .object({
      fullName: z.string(),
      line1: z.string(),
      line2: z.string().optional(),
      city: z.string(),
      state: z.string(),
      postalCode: z.string(),
      country: z.string(),
      phone: z.string().optional(),
    })
    .optional(),
});

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;

export async function createCheckoutSession(input: CheckoutInput) {
  const session = await auth();
  const body = checkoutInputSchema.parse(input);

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: body.items.map((i) => i.variantId) } },
    include: { product: { include: { images: { take: 1 } } } },
  });

  if (variants.length !== body.items.length) {
    return { error: "Invalid cart items" };
  }

  let discountId: string | undefined;
  let discountAmount = 0;

  if (body.discountCode) {
    const discount = await prisma.discount.findFirst({
      where: {
        code: body.discountCode.toUpperCase(),
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    if (discount && (!discount.maxUses || discount.usedCount < discount.maxUses)) {
      discountId = discount.id;
    }
  }

  const lineItems = body.items.map((item) => {
    const variant = variants.find((v) => v.id === item.variantId)!;
    if (variant.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${variant.product.name}`);
    }
    return {
      variantId: variant.id,
      quantity: item.quantity,
      price: Number(variant.price),
      stripeItem: {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${variant.product.name} (${variant.size} / ${variant.color})`,
            images: variant.product.images[0]?.url
              ? [variant.product.images[0].url]
              : undefined,
          },
          unit_amount: Math.round(Number(variant.price) * 100),
        },
        quantity: item.quantity,
      },
    };
  });

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  if (discountId) {
    const discount = await prisma.discount.findUnique({
      where: { id: discountId },
    });
    if (discount) {
      if (discount.type === "PERCENTAGE") {
        discountAmount = subtotal * (Number(discount.value) / 100);
      } else if (discount.type === "FIXED") {
        discountAmount = Number(discount.value);
      }
    }
  }

  let addressId = body.addressId;

  if (!addressId && body.shippingAddress && session?.user?.id) {
    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        fullName: body.shippingAddress.fullName,
        line1: body.shippingAddress.line1,
        line2: body.shippingAddress.line2,
        city: body.shippingAddress.city,
        state: body.shippingAddress.state,
        postalCode: body.shippingAddress.postalCode,
        country: body.shippingAddress.country,
        phone: body.shippingAddress.phone,
      },
    });
    addressId = address.id;
  }

  const stripe = getStripe();
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: session?.user?.email ?? body.guestEmail,
    line_items: lineItems.map((i) => i.stripeItem),
    success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/cart`,
    metadata: {
      userId: session?.user?.id ?? "",
      addressId: addressId ?? "",
      discountId: discountId ?? "",
      subtotal: subtotal.toString(),
      shippingCost: body.shippingCost.toString(),
      discountAmount: discountAmount.toString(),
      taxAmount: "0",
      items: JSON.stringify(
        lineItems.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
          price: i.price,
        })),
      ),
    },
  });

  if (discountId) {
    await prisma.discount.update({
      where: { id: discountId },
      data: { usedCount: { increment: 1 } },
    });
  }

  return { url: checkoutSession.url };
}
