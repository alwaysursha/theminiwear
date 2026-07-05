"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import type { AdminSaveState } from "@/lib/admin-form-state";
import { prisma } from "@/lib/prisma";

export async function addCustomerNote(
  _prev: AdminSaveState,
  formData: FormData,
): Promise<AdminSaveState> {
  const session = await requireAdmin();

  const customerId = String(formData.get("customerId") ?? "").trim();
  if (!customerId) {
    return { error: "Customer not found." };
  }

  const content = formData.get("content") as string;
  const tagsRaw = formData.get("tags") as string;

  if (!content?.trim()) {
    return { error: "Note content is required." };
  }

  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  try {
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
    return { ok: true };
  } catch {
    return { error: "Could not save note. Please try again." };
  }
}

export async function deleteCustomerNote(noteId: string, customerId: string) {
  await requireAdmin();

  await prisma.customerNote.delete({ where: { id: noteId } });

  revalidatePath(`/admin/customers/${customerId}`);
}
