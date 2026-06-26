"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
});

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  try {
    const data = profileSchema.parse({
      name: formData.get("name"),
      phone: formData.get("phone") || undefined,
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: data.name, phone: data.phone },
    });

    revalidatePath("/account/profile");
    return { success: true };
  } catch {
    return { error: "Invalid profile data" };
  }
}
