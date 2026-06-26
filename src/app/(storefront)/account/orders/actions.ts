"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    include: { returnRequest: true },
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

  revalidatePath(`/account/orders/${orderId}`);
  return { success: true };
}
