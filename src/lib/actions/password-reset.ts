"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  buildPasswordResetUrl,
  renderPasswordResetEmail,
} from "@/emails/templates/password-reset";
import { auth, resolveSessionUser } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { isAdminRole } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import {
  consumePasswordResetToken,
  createPasswordResetToken,
} from "@/lib/password-reset";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

async function issuePasswordResetForEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findFirst({
    where: {
      email: { equals: normalizedEmail, mode: "insensitive" },
    },
    select: { id: true, email: true, name: true, password: true },
  });

  if (!user?.password) {
    return { ok: true as const };
  }

  const token = await createPasswordResetToken(user.email);
  const resetUrl = buildPasswordResetUrl(token);

  await sendPasswordResetEmail({
    to: user.email,
    name: user.name ?? "there",
    resetUrl,
  });

  return { ok: true as const };
}

export async function requestPasswordReset(formData: FormData) {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: "Enter a valid email address." };
  }

  try {
    await issuePasswordResetForEmail(parsed.data.email);
    return {
      ok: true,
      message:
        "If an account exists with that email, we sent a password reset link.",
    };
  } catch (error) {
    console.error("requestPasswordReset failed:", error);
    return { error: "Could not send reset email. Please try again." };
  }
}

export async function requestPasswordResetForCurrentUser() {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: "You need to be signed in." };
  }

  const user = await resolveSessionUser(session);
  if (!user?.password) {
    return {
      error:
        "This account uses Google sign-in and does not have a password to reset.",
    };
  }

  try {
    await issuePasswordResetForEmail(user.email);
    return {
      ok: true,
      message: `A password reset link was sent to ${user.email}.`,
    };
  } catch (error) {
    console.error("requestPasswordResetForCurrentUser failed:", error);
    return { error: "Could not send reset email. Please try again." };
  }
}

export async function resetPassword(formData: FormData) {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const message =
      parsed.error.flatten().fieldErrors.confirmPassword?.[0] ??
      parsed.error.flatten().fieldErrors.password?.[0] ??
      "Invalid password reset details.";
    return { error: message };
  }

  const email = await consumePasswordResetToken(parsed.data.token);
  if (!email) {
    return {
      error: "This reset link is invalid or has expired. Please request a new one.",
    };
  }

  try {
    const hashed = await bcrypt.hash(parsed.data.password, 12);
    await prisma.user.update({
      where: { email },
      data: { password: hashed },
    });

    return { ok: true };
  } catch (error) {
    console.error("resetPassword failed:", error);
    return { error: "Could not update password. Please try again." };
  }
}

export async function getPasswordResetContext() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const user = await resolveSessionUser(session);
  if (!user) {
    return null;
  }

  return {
    name: user.name ?? "",
    email: user.email,
    phone: user.phone ?? "",
    hasPassword: Boolean(user.password),
    isAdmin: isAdminRole(user.role),
  };
}
