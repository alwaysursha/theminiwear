"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function deleteNewsletterSubscriber(subscriberId: string) {
  await requireAdmin();

  await prisma.newsletterSubscriber.delete({
    where: { id: subscriberId },
  });

  revalidatePath("/admin/newsletter");
}
