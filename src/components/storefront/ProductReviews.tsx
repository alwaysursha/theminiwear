import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  canUserReviewProduct,
  getApprovedReviewsForProduct,
  getProductRatingSummary,
} from "@/lib/review-utils";
import { ReviewFormGate } from "@/components/storefront/ReviewForm";
import { ReviewList } from "@/components/storefront/ReviewList";
import { StarRating } from "@/components/storefront/StarRating";

type ProductReviewsProps = {
  productId: string;
};

export async function ProductReviews({ productId }: ProductReviewsProps) {
  const session = await auth();

  const [summary, reviews, userReview, eligibility] = await Promise.all([
    getProductRatingSummary(productId),
    getApprovedReviewsForProduct(productId),
    session?.user
      ? prisma.productReview.findUnique({
          where: {
            userId_productId: {
              userId: session.user.id,
              productId,
            },
          },
          select: { status: true },
        })
      : Promise.resolve(null),
    session?.user
      ? canUserReviewProduct(session.user.id, productId)
      : Promise.resolve({ canReview: false as const, reason: "not_eligible" as const }),
  ]);

  return (
    <section className="mt-16 border-t border-navy/10 pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy">Reviews</h2>
          {summary.count > 0 ? (
            <div className="mt-2 flex items-center gap-2">
              <StarRating rating={summary.average} />
              <span className="text-sm text-navy/60">
                {summary.average.toFixed(1)} · {summary.count} review
                {summary.count === 1 ? "" : "s"}
              </span>
            </div>
          ) : (
            <p className="mt-1 text-sm text-navy/55">No approved reviews yet.</p>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
        <ReviewList reviews={reviews} currentUserId={session?.user.id} />
        <ReviewFormGate
          productId={productId}
          isLoggedIn={!!session?.user}
          canReview={eligibility.canReview}
          existingStatus={userReview?.status ?? null}
        />
      </div>
    </section>
  );
}
