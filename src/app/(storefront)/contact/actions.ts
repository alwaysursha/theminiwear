"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const inquirySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(10),
});

export async function submitInquiry(formData: FormData) {
  try {
    const session = await auth();
    const data = inquirySchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    });

    const inquiry = await prisma.inquiry.create({
      data: {
        userId: session?.user?.id,
        guestEmail: session?.user ? undefined : data.email,
        guestName: session?.user ? undefined : data.name,
        subject: data.subject,
        messages: {
          create: {
            content: data.message,
            senderId: session?.user?.id,
            isStaff: false,
          },
        },
      },
    });

    return { success: true, inquiryId: inquiry.id };
  } catch {
    return { success: false, error: "Failed to submit inquiry" };
  }
}
