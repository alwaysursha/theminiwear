"use server";

import { revalidatePath } from "next/cache";
import { InquiryStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${inquiryId}`);
}

export async function updateInquiryStatus(
  inquiryId: string,
  status: InquiryStatus,
) {
  await requireAdmin();

  await prisma.inquiry.update({
    where: { id: inquiryId },
    data: { status },
  });

  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${inquiryId}`);
}

export async function assignInquiry(inquiryId: string, assigneeId: string) {
  await requireAdmin();

  await prisma.inquiry.update({
    where: { id: inquiryId },
    data: {
      assigneeId,
      status: InquiryStatus.IN_PROGRESS,
    },
  });

  revalidatePath(`/admin/inquiries/${inquiryId}`);
}
