"use server";

import { revalidatePath } from "next/cache";
import { InquiryStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendInquiryReplyEmail } from "@/lib/email";

export async function replyToInquiry(inquiryId: string, formData: FormData) {
  const session = await requireAdmin();

  const content = formData.get("content") as string;
  const status = formData.get("status") as InquiryStatus | null;

  if (!content?.trim()) {
    throw new Error("Reply content is required");
  }

  await prisma.inquiryMessage.create({
    data: {
      inquiryId,
      senderId: session.user.id,
      isStaff: true,
      content: content.trim(),
    },
  });

  const updateData: { status?: InquiryStatus; assigneeId?: string } = {};
  if (status) {
    updateData.status = status;
  }
  if (!status || status === InquiryStatus.IN_PROGRESS) {
    updateData.assigneeId = session.user.id;
    if (!status) {
      updateData.status = InquiryStatus.IN_PROGRESS;
    }
  }

  await prisma.inquiry.update({
    where: { id: inquiryId },
    data: updateData,
  });

  const inquiry = await prisma.inquiry.findUnique({
    where: { id: inquiryId },
    include: { user: true },
  });

  const recipientEmail = inquiry?.user?.email ?? inquiry?.guestEmail;
  if (recipientEmail && inquiry) {
    void sendInquiryReplyEmail({
      to: recipientEmail,
      subject: inquiry.subject,
      message: content.trim(),
    });
  }

  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${inquiryId}`);
}

export async function updateInquiryStatus(
  inquiryId: string,
  formData: FormData,
) {
  await requireAdmin();

  const status = formData.get("status") as InquiryStatus;
  if (!status || !Object.values(InquiryStatus).includes(status)) {
    throw new Error("Invalid status");
  }

  await prisma.inquiry.update({
    where: { id: inquiryId },
    data: { status },
  });

  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${inquiryId}`);
}

export async function assignInquiry(inquiryId: string, formData: FormData) {
  await requireAdmin();

  const assigneeId = formData.get("assigneeId") as string;
  if (!assigneeId) {
    throw new Error("Assignee is required");
  }

  await prisma.inquiry.update({
    where: { id: inquiryId },
    data: {
      assigneeId,
      status: InquiryStatus.IN_PROGRESS,
    },
  });

  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${inquiryId}`);
}
