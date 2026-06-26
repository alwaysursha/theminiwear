"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function addCustomerNote(customerId: string, formData: FormData) {
  const session = await requireAdmin();

  const content = formData.get("content") as string;
  const tagsRaw = formData.get("tags") as string;

  if (!content?.trim()) {
    throw new Error("Note content is required");
  }

  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  await prisma.customerNote.create({
    data: {
      customerId,
      authorId: session.user.id,
      content: content.trim(),
      tags,
    },
  });

  revalidatePath(`/admin/customers/${customerId}`);
  revalidatePath("/admin/customers");
}

export async function deleteCustomerNote(noteId: string, customerId: string) {
  await requireAdmin();

  await prisma.customerNote.delete({ where: { id: noteId } });

  revalidatePath(`/admin/customers/${customerId}`);
}
