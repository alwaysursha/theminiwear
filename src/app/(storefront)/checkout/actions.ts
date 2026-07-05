"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { STRIPE_CURRENCY } from "@/lib/currency";
import { getSiteUrl } from "@/emails/theme";
import {
  stripeCheckoutErrorMessage,
  stripeCheckoutProductData,
  stripeCheckoutShippingLineItem,
} from "@/lib/stripe-checkout";
import {
  CUSTOM_SIZE_FEE,
  sanitizeMeasurements,
  summarizeMeasurements,
  hasMeasurements,
} from "@/lib/custom-size";
import {
  DEFAULT_SHIPPING_COUNTRY,
  getShippingQuotes,
  resolveCheckoutShipping,
  resolveShippingCountry,
} from "@/lib/shipping";
import { z } from "zod";

const checkoutInputSchema = z.object({
  items: z.array(
    z.object({
      variantId: z.string(),
      quantity: z.number().min(1),
      custom: z
        .object({
          measurements: z.record(z.string(), z.string()),
        })
        .optional(),
    }),
  ),
  addressId: z.string().optional(),
  guestEmail: z.string().email().optional(),
  shippingRateId: z.string().min(1),
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
  try {
    const parsed = checkoutInputSchema.safeParse(input);
    if (!parsed.success) {
      return { error: "Invalid checkout details. Please refresh and try again." };
    }
    const body = parsed.data;

    const session = await auth();

  const variantIds = [...new Set(body.items.map((i) => i.variantId))];
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: { include: { images: { take: 1 } } } },
  });
  const variantMap = new Map(variants.map((v) => [v.id, v]));

  if (body.items.some((i) => !variantMap.has(i.variantId))) {
    return { error: "Invalid cart items" };
  }

  // A variant can appear across multiple lines (e.g. a standard line plus one
  // or more custom-fit lines), so validate stock against the combined quantity.
  const quantityByVariant = new Map<string, number>();
  for (const item of body.items) {
    quantityByVariant.set(
      item.variantId,
      (quantityByVariant.get(item.variantId) ?? 0) + item.quantity,
    );
  }
  for (const [variantId, totalQuantity] of quantityByVariant) {
    const variant = variantMap.get(variantId)!;
    if (variant.stock < totalQuantity) {
      return { error: `Insufficient stock for ${variant.product.name}` };
    }
  }

  let discountId: string | undefined;
  let discountAmount = 0;
  let freeShippingDiscount = false;

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
    const variant = variantMap.get(item.variantId)!;

    const measurements = item.custom
      ? sanitizeMeasurements(item.custom.measurements)
      : null;
    const isCustom = measurements != null && hasMeasurements(measurements);
    const customFee = isCustom ? CUSTOM_SIZE_FEE : 0;
    const unitPrice = Number(variant.price) + customFee;

    const baseName = `${variant.product.name} (${variant.size} / ${variant.color})`;
    const description =
      isCustom && measurements
        ? summarizeMeasurements(measurements) || "Custom-fit tailoring"
        : undefined;

    return {
      variantId: variant.id,
      quantity: item.quantity,
      price: unitPrice,
      customFee,
      measurements: isCustom ? measurements : null,
      stripeItem: {
        price_data: {
          currency: STRIPE_CURRENCY,
          product_data: stripeCheckoutProductData({
            name: isCustom ? `${baseName} — Custom fit` : baseName,
            description,
            imageUrl: variant.product.images[0]?.url,
          }),
          unit_amount: Math.round(unitPrice * 100),
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
      } else if (discount.type === "FREE_SHIPPING") {
        freeShippingDiscount = true;
      }
    }
  }

  const shippingCountry =
    (await resolveShippingCountry({
      addressId: body.addressId,
      shippingAddress: body.shippingAddress,
      userId: session?.user?.id,
    })) ?? DEFAULT_SHIPPING_COUNTRY;

  const shipping = await resolveCheckoutShipping({
    shippingRateId: body.shippingRateId,
    country: shippingCountry,
    subtotal,
    freeShippingDiscount,
  });

  if ("error" in shipping) {
    return { error: shipping.error };
  }

  let addressId = body.addressId;

  if (session?.user?.id) {
    const userId = session.user.id;
    const sa = body.shippingAddress;

    // Persist a freshly entered shipping address to the customer's profile
    // (deduping against an identical one they already have on file).
    if (!addressId && sa) {
      const duplicate = await prisma.address.findFirst({
        where: {
          userId,
          line1: sa.line1,
          postalCode: sa.postalCode,
          city: sa.city,
        },
      });

      if (duplicate) {
        addressId = duplicate.id;
      } else {
        const existingCount = await prisma.address.count({ where: { userId } });
        const created = await prisma.address.create({
          data: {
            userId,
            fullName: sa.fullName,
            line1: sa.line1,
            line2: sa.line2,
            city: sa.city,
            state: sa.state,
            postalCode: sa.postalCode,
            country: sa.country,
            phone: sa.phone,
            isDefault: existingCount === 0,
          },
        });
        addressId = created.id;
      }
    }

    // Pull the shopper's name/phone into their profile when it isn't set yet.
    if (sa) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, phone: true },
      });
      const updates: { name?: string; phone?: string } = {};
      if (user && (!user.name || user.name.trim() === "")) {
        updates.name = sa.fullName;
      }
      if (
        user &&
        (!user.phone || user.phone.trim() === "") &&
        sa.phone &&
        sa.phone.trim() !== ""
      ) {
        updates.phone = sa.phone;
      }
      if (Object.keys(updates).length > 0) {
        await prisma.user.update({ where: { id: userId }, data: updates });
      }
    }
  }

  const stripe = await getStripe();
  const siteUrl = getSiteUrl();
  const shippingLineItem = stripeCheckoutShippingLineItem({
    shippingCost: shipping.shippingCost,
    label: shipping.shippingLabel,
  });

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: session?.user?.email ?? body.guestEmail,
    line_items: [
      ...lineItems.map((i) => i.stripeItem),
      ...(shippingLineItem ? [shippingLineItem] : []),
    ],
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/cart`,
    metadata: {
      userId: session?.user?.id ?? "",
      addressId: addressId ?? "",
      discountId: discountId ?? "",
      subtotal: subtotal.toString(),
      shippingCost: shipping.shippingCost.toString(),
      shippingRateId: shipping.shippingRateId,
      shippingLabel: shipping.shippingLabel,
      discountAmount: discountAmount.toString(),
      taxAmount: "0",
      items: JSON.stringify(
        lineItems.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
          price: i.price,
          ...(i.customFee > 0
            ? { customFee: i.customFee, measurements: i.measurements }
            : {}),
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
  } catch (error) {
    console.error("createCheckoutSession failed:", error);
    return { error: stripeCheckoutErrorMessage(error) };
  }
}

export async function fetchShippingQuotes(country: string, subtotal: number) {
  return getShippingQuotes(country, subtotal);
}

const addressUpdateSchema = z.object({
  id: z.string().min(1),
  fullName: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().optional(),
});

export type AddressUpdateInput = z.infer<typeof addressUpdateSchema>;

export async function updateAddress(input: AddressUpdateInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You need to be signed in to edit an address." };
  }

  const parsed = addressUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please fill in every required field." };
  }
  const data = parsed.data;

  const existing = await prisma.address.findFirst({
    where: { id: data.id, userId: session.user.id },
  });
  if (!existing) {
    return { error: "Address not found." };
  }

  const updated = await prisma.address.update({
    where: { id: data.id },
    data: {
      fullName: data.fullName,
      line1: data.line1,
      line2: data.line2 || null,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country,
      phone: data.phone || null,
    },
  });

  return {
    success: true as const,
    address: {
      id: updated.id,
      label: updated.label,
      fullName: updated.fullName,
      line1: updated.line1,
      line2: updated.line2,
      city: updated.city,
      state: updated.state,
      postalCode: updated.postalCode,
      country: updated.country,
      phone: updated.phone,
      isDefault: updated.isDefault,
    },
  };
}
