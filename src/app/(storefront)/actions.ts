"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function subscribeNewsletter(formData: FormData) {
  const email = formData.get("email");
  const parsed = z.string().email().safeParse(email);
  if (!parsed.success) {
    return { success: false };
  }

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: parsed.data },
      create: { email: parsed.data },
      update: {},
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

const inquirySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(10),
});

export async function submitInquiry(formData: FormData) {
  const parsed = inquirySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { success: false, error: "Please fill in all fields correctly." };
  }

  const { name, email, subject, message } = parsed.data;

  try {
    await prisma.inquiry.create({
      data: {
        guestName: name,
        guestEmail: email,
        subject,
        messages: {
          create: {
            content: message,
            isStaff: false,
          },
        },
      },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to submit inquiry." };
  }
}

const signUpSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function registerUser(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid registration details." };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "An account with this email already exists." };
  }

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { name, email, password: hashed },
  });

  return { success: true };
}
