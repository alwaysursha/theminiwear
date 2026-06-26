"use server";

import { revalidatePath } from "next/cache";
import { ReviewStatus } from "@prisma/client";
import { auth, requireRoleAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  canUserReviewProduct,
  validateReviewInput,
} from "@/lib/review-utils";

type ActionResult = { success: true } | { success: false; error: string };

type ParsedReviewForm =
  | { ok: true; rating: number; title: string | null; body: string }
  | { ok: false; error: string };

function parseReviewForm(formData: FormData): ParsedReviewForm {
  const rating = Number(formData.get("rating"));
  const title = (formData.get("title") as string | null) ?? undefined;
  const body = (formData.get("body") as string) ?? "";

  const validationError = validateReviewInput(rating, body, title);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  return {
    ok: true,
    rating,
    title: title?.trim() || null,
    body: body.trim(),
  };
}

export async function submitProductReview(
  productId: string,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Sign in to leave a review." };
  }

  const parsed = parseReviewForm(formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error };
  }

  const eligibility = await canUserReviewProduct(session.user.id, productId);
  if (!eligibility.canReview) {
    if (eligibility.reason === "already_reviewed") {
      return { success: false, error: "You have already reviewed this product." };
    }
    return {
      success: false,
      error: "Only verified purchasers can review this product after delivery.",
    };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId, isActive: true },
    select: { slug: true },
  });

  if (!product) {
    return { success: false, error: "Product not found." };
  }

  await prisma.productReview.create({
    data: {
      productId,
      userId: session.user.id,
      orderId: eligibility.orderId,
      rating: parsed.rating,
      title: parsed.title,
      body: parsed.body,
      status: ReviewStatus.PENDING,
    },
  });

  revalidatePath(`/product/${product.slug}`);
  return { success: true };
}

export async function approveProductReview(reviewId: string): Promise<void> {
  const { adminId } = await requireRoleAdmin();

  const review = await prisma.productReview.update({
    where: { id: reviewId },
    data: {
      status: ReviewStatus.APPROVED,
      moderatedById: adminId,
      moderatedAt: new Date(),
      rejectionNote: null,
    },
    include: { product: { select: { slug: true } } },
  });

  revalidatePath(`/product/${review.product.slug}`);
  revalidatePath("/admin/reviews");
  revalidatePath(`/admin/reviews/${reviewId}`);
}

export async function rejectProductReview(
  reviewId: string,
  formData: FormData,
): Promise<void> {
  const { adminId } = await requireRoleAdmin();

  const rejectionNote = (formData.get("rejectionNote") as string | null)?.trim() || null;

  const review = await prisma.productReview.update({
    where: { id: reviewId },
    data: {
      status: ReviewStatus.REJECTED,
      moderatedById: adminId,
      moderatedAt: new Date(),
      rejectionNote,
    },
    include: { product: { select: { slug: true } } },
  });

  revalidatePath(`/product/${review.product.slug}`);
  revalidatePath("/admin/reviews");
  revalidatePath(`/admin/reviews/${reviewId}`);
}

export async function updateProductReview(
  reviewId: string,
  formData: FormData,
): Promise<void> {
  const { adminId } = await requireRoleAdmin();

  const parsed = parseReviewForm(formData);
  if (!parsed.ok) {
    throw new Error(parsed.error);
  }

  const review = await prisma.productReview.update({
    where: { id: reviewId },
    data: {
      rating: parsed.rating,
      title: parsed.title,
      body: parsed.body,
      moderatedById: adminId,
      moderatedAt: new Date(),
    },
    include: { product: { select: { slug: true } } },
  });

  revalidatePath(`/product/${review.product.slug}`);
  revalidatePath("/admin/reviews");
  revalidatePath(`/admin/reviews/${reviewId}`);
}

export async function deleteProductReview(reviewId: string): Promise<void> {
  await requireRoleAdmin();

  const review = await prisma.productReview.delete({
    where: { id: reviewId },
    include: { product: { select: { slug: true } } },
  });

  revalidatePath(`/product/${review.product.slug}`);
  revalidatePath("/admin/reviews");
}
