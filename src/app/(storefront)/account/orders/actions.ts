"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendReturnRequestedEmail, sendAdminReturnRequestEmail } from "@/lib/email";
import { orderItemProductName } from "@/lib/order-item-display";

export async function requestReturn(orderId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const reason = formData.get("reason") as string;
  if (!reason?.trim()) {
    return { success: false, error: "Reason is required" };
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id },
    include: {
      returnRequest: true,
      user: true,
      items: {
        include: {
          variant: { include: { product: true } },
        },
      },
    },
  });

  if (!order) {
    return { success: false, error: "Order not found" };
  }

  if (!["DELIVERED", "SHIPPED"].includes(order.status)) {
    return { success: false, error: "This order is not eligible for return" };
  }

  if (order.returnRequest) {
    return { success: false, error: "Return already requested" };
  }

  await prisma.returnRequest.create({
    data: { orderId, reason: reason.trim() },
  });

  const email = order.user?.email ?? order.guestEmail;
  if (email) {
    void sendReturnRequestedEmail({
      to: email,
      orderNumber: order.orderNumber,
      productNames: order.items.map((item) => orderItemProductName(item)),
      reason: reason.trim(),
    });
  }

  if (email) {
    void sendAdminReturnRequestEmail({
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerEmail: email,
      reason: reason.trim(),
    });
  }

  revalidatePath(`/account/orders/${orderId}`);
  return { success: true };
}
