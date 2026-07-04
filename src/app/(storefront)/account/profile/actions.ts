"use server";

import { revalidatePath } from "next/cache";
import { auth, resolveSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
});

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Unauthorized" };

  try {
    const data = profileSchema.parse({
      name: formData.get("name"),
      phone: formData.get("phone") || undefined,
    });

    const user = await resolveSessionUser(session);
    if (!user) return { error: "User not found" };

    await prisma.user.update({
      where: { id: user.id },
      data: { name: data.name, phone: data.phone },
    });

    revalidatePath("/account/profile");
    return { success: true };
  } catch {
    return { error: "Invalid profile data" };
  }
}
