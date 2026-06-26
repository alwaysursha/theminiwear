"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const messageSchema = z.object({
  inquiryId: z.string(),
  content: z.string().min(1),
});

export async function replyToInquiry(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  try {
    const data = messageSchema.parse({
      inquiryId: formData.get("inquiryId"),
      content: formData.get("content"),
    });

    const inquiry = await prisma.inquiry.findFirst({
      where: { id: data.inquiryId, userId: session.user.id },
    });

    if (!inquiry) return { error: "Inquiry not found" };

    await prisma.inquiryMessage.create({
      data: {
        inquiryId: data.inquiryId,
        content: data.content,
        senderId: session.user.id,
        isStaff: false,
      },
    });

    await prisma.inquiry.update({
      where: { id: data.inquiryId },
      data: { updatedAt: new Date() },
    });

    revalidatePath(`/account/inquiries/${data.inquiryId}`);
    return { success: true };
  } catch {
    return { error: "Failed to send message" };
  }
}
