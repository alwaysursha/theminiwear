import { OrderStatus, ReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const reviewInclude = {
  user: { select: { id: true, name: true } },
  product: { select: { id: true, name: true, slug: true } },
  order: { select: { id: true, orderNumber: true } },
  moderatedBy: { select: { id: true, name: true } },
} as const;

export function formatReviewerName(name: string | null | undefined): string {
  if (!name?.trim()) {
    return "Customer";
  }

  const parts = name.trim().split(/\s+/);
  const first = parts[0];
  if (parts.length === 1) {
    return first;
  }

  const lastInitial = parts[parts.length - 1]?.[0]?.toUpperCase();
  return lastInitial ? `${first} ${lastInitial}.` : first;
}

export async function findDeliveredPurchaseOrder(
  userId: string,
  productId: string,
) {
  return prisma.order.findFirst({
    where: {
      userId,
      status: OrderStatus.DELIVERED,
      items: {
        some: {
          variant: { productId },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function canUserReviewProduct(userId: string, productId: string) {
  const existingReview = await prisma.productReview.findUnique({
    where: {
      userId_productId: { userId, productId },
    },
  });

  if (existingReview) {
    return { canReview: false as const, reason: "already_reviewed" as const };
  }

  const order = await findDeliveredPurchaseOrder(userId, productId);
  if (!order) {
    return { canReview: false as const, reason: "not_eligible" as const };
  }

  return { canReview: true as const, orderId: order.id };
}

export async function getApprovedReviewsForProduct(productId: string) {
  return prisma.productReview.findMany({
    where: { productId, status: ReviewStatus.APPROVED },
    include: reviewInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductRatingSummary(productId: string) {
  const result = await prisma.productReview.aggregate({
    where: { productId, status: ReviewStatus.APPROVED },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    average: result._avg.rating ?? 0,
    count: result._count.rating,
  };
}

export function validateReviewInput(rating: number, body: string, title?: string) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return "Rating must be between 1 and 5 stars.";
  }

  const trimmedBody = body.trim();
  if (trimmedBody.length < 10) {
    return "Review must be at least 10 characters.";
  }
  if (trimmedBody.length > 2000) {
    return "Review must be 2000 characters or fewer.";
  }

  const trimmedTitle = title?.trim();
  if (trimmedTitle && trimmedTitle.length > 120) {
    return "Title must be 120 characters or fewer.";
  }

  return null;
}
