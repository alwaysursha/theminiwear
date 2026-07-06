"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { AdminSaveState } from "@/lib/admin-form-state";
import { requireAdmin, resolveSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  phone: z.string().trim().optional(),
});

export async function updateAdminProfile(
  _prev: AdminSaveState,
  formData: FormData,
): Promise<AdminSaveState> {
  const session = await requireAdmin();
  const user = await resolveSessionUser(session);

  if (!user) {
    return { error: "User not found." };
  }

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.name?.[0] ?? "Invalid profile data." };
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone || null,
      },
    });

    revalidatePath("/admin/profile");
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    console.error("updateAdminProfile failed:", error);
    return { error: "Could not save profile. Please try again." };
  }
}
