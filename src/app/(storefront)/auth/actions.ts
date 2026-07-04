"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";
import { z } from "zod";

const signUpSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function registerUser(formData: FormData) {
  try {
    const data = signUpSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return { error: "An account with this email already exists" };
    }

    const hashed = await bcrypt.hash(data.password, 12);
    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashed,
      },
    });

    void sendWelcomeEmail({ to: data.email, name: data.name });

    return { success: true };
  } catch {
    return { error: "Invalid registration data" };
  }
}
