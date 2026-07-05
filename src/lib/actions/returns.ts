"use server";

import { revalidatePath } from "next/cache";
import { ReturnStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateReturnStatus(
  returnId: string,
  status: ReturnStatus,
) {
  await requireAdmin();

  await prisma.returnRequest.update({
    where: { id: returnId },
    data: { status },
  });

  revalidatePath("/admin/returns");
  revalidatePath("/admin/orders");
}
