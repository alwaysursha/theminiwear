"use server";

import { revalidatePath } from "next/cache";
import { InquiryStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import type { AdminSaveState } from "@/lib/admin-form-state";
import { prisma } from "@/lib/prisma";
import { sendInquiryReplyEmail } from "@/lib/email";

export async function replyToInquiry(
  _prev: AdminSaveState,
  formData: FormData,
): Promise<AdminSaveState> {
  const session = await requireAdmin();

  const inquiryId = String(formData.get("inquiryId") ?? "").trim();
  if (!inquiryId) {
    return { error: "Inquiry not found." };
  }

  const content = formData.get("content") as string;
  const status = formData.get("status") as InquiryStatus | null;

  if (!content?.trim()) {
    return { error: "Reply content is required." };
  }

  try {
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
    return { ok: true };
  } catch {
    return { error: "Could not send reply. Please try again." };
  }
}

export async function updateInquiryStatus(
  _prev: AdminSaveState,
  formData: FormData,
): Promise<AdminSaveState> {
  await requireAdmin();

  const inquiryId = String(formData.get("inquiryId") ?? "").trim();
  if (!inquiryId) {
    return { error: "Inquiry not found." };
  }

  const status = formData.get("status") as InquiryStatus;
  if (!status || !Object.values(InquiryStatus).includes(status)) {
    return { error: "Invalid status." };
  }

  try {
    await prisma.inquiry.update({
      where: { id: inquiryId },
      data: { status },
    });

    revalidatePath("/admin/inquiries");
    revalidatePath(`/admin/inquiries/${inquiryId}`);
    return { ok: true };
  } catch {
    return { error: "Could not save status. Please try again." };
  }
}

export async function assignInquiry(
  _prev: AdminSaveState,
  formData: FormData,
): Promise<AdminSaveState> {
  await requireAdmin();

  const inquiryId = String(formData.get("inquiryId") ?? "").trim();
  if (!inquiryId) {
    return { error: "Inquiry not found." };
  }

  const assigneeId = formData.get("assigneeId") as string;
  if (!assigneeId) {
    return { error: "Assignee is required." };
  }

  try {
    await prisma.inquiry.update({
      where: { id: inquiryId },
      data: {
        assigneeId,
        status: InquiryStatus.IN_PROGRESS,
      },
    });

    revalidatePath("/admin/inquiries");
    revalidatePath(`/admin/inquiries/${inquiryId}`);
    return { ok: true };
  } catch {
    return { error: "Could not assign inquiry. Please try again." };
  }
}
