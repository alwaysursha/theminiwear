"use server";

import { revalidatePath } from "next/cache";
import { OrderStatus, ShipmentStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import type { AdminSaveState } from "@/lib/admin-form-state";
import { prisma } from "@/lib/prisma";
import { sendShippingUpdateEmail } from "@/lib/email";
import { productRefundAmount } from "@/lib/order-refund";
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
  _prev: AdminSaveState,
  formData: FormData,
): Promise<AdminSaveState> {
  const orderId = String(formData.get("orderId") ?? "").trim();
  if (!orderId) {
    return { error: "Order not found." };
  }

  const status = formData.get("status") as OrderStatus;
  const note = formData.get("note") as string;

  try {
    await updateOrderStatus(orderId, status, note || undefined);
    return { ok: true };
  } catch {
    return { error: "Could not update order status. Please try again." };
  }
}

export async function updateShipment(
  _prev: AdminSaveState,
  formData: FormData,
): Promise<AdminSaveState> {
  await requireAdmin();

  const orderId = String(formData.get("orderId") ?? "").trim();
  if (!orderId) {
    return { error: "Order not found." };
  }

  const carrier = formData.get("carrier") as string;
  const trackingNumber = formData.get("trackingNumber") as string;
  const status = (formData.get("status") as ShipmentStatus) || ShipmentStatus.PENDING;

  try {
    const existing = await prisma.shipment.findUnique({
      where: { orderId },
    });

    const wasInTransit = existing?.status === ShipmentStatus.IN_TRANSIT;

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

      if (!wasInTransit) {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { user: true },
        });
        const email = order?.user?.email ?? order?.guestEmail;
        if (email && order) {
          void sendShippingUpdateEmail({
            to: email,
            orderNumber: order.orderNumber,
            trackingNumber,
            carrier,
          });
        }
      }
    }

    revalidatePath(`/admin/orders/${orderId}`);
    return { ok: true };
  } catch {
    return { error: "Could not save tracking. Please try again." };
  }
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

  const refundAmount = productRefundAmount(order);
  if (refundAmount <= 0) {
    throw new Error("Nothing to refund on products for this order");
  }

  if (order.stripePaymentId) {
    const stripe = await getStripe();
    await stripe.refunds.create({
      payment_intent: order.stripePaymentId,
      amount: Math.round(refundAmount * 100),
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
        note: `Product refund processed (${refundAmount.toFixed(2)}; shipping non-refundable)`,
      },
    }),
  ]);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
