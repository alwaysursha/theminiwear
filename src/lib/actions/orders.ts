"use server";

import { revalidatePath } from "next/cache";
import { OrderStatus, ShipmentStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string,
) {
  await requireAdmin();

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status },
    }),
    prisma.orderStatusHistory.create({
      data: {
        orderId,
        status,
        note: note || null,
      },
    }),
  ]);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function updateOrderStatusFromForm(
  orderId: string,
  formData: FormData,
) {
  const status = formData.get("status") as OrderStatus;
  const note = formData.get("note") as string;
  await updateOrderStatus(orderId, status, note || undefined);
}

export async function updateShipment(
  orderId: string,
  formData: FormData,
) {
  await requireAdmin();

  const carrier = formData.get("carrier") as string;
  const trackingNumber = formData.get("trackingNumber") as string;
  const status = (formData.get("status") as ShipmentStatus) || ShipmentStatus.PENDING;

  const existing = await prisma.shipment.findUnique({
    where: { orderId },
  });

  if (existing) {
    await prisma.shipment.update({
      where: { orderId },
      data: {
        carrier,
        trackingNumber,
        status,
        shippedAt:
          status === ShipmentStatus.IN_TRANSIT && !existing.shippedAt
            ? new Date()
            : existing.shippedAt,
        deliveredAt:
          status === ShipmentStatus.DELIVERED ? new Date() : existing.deliveredAt,
      },
    });
  } else {
    await prisma.shipment.create({
      data: {
        orderId,
        carrier,
        trackingNumber,
        status,
        shippedAt: status === ShipmentStatus.IN_TRANSIT ? new Date() : null,
        deliveredAt: status === ShipmentStatus.DELIVERED ? new Date() : null,
      },
    });
  }

  if (status === ShipmentStatus.IN_TRANSIT) {
    await updateOrderStatus(orderId, OrderStatus.SHIPPED, "Shipment created");
  }

  revalidatePath(`/admin/orders/${orderId}`);
}

export async function refundOrder(orderId: string) {
  await requireAdmin();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status === OrderStatus.REFUNDED) {
    throw new Error("Order already refunded");
  }

  if (order.stripePaymentId) {
    const stripe = await getStripe();
    await stripe.refunds.create({
      payment_intent: order.stripePaymentId,
    });
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.REFUNDED },
    }),
    prisma.orderStatusHistory.create({
      data: {
        orderId,
        status: OrderStatus.REFUNDED,
        note: "Refund processed",
      },
    }),
  ]);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
