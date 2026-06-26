import { format } from "date-fns";
import type { ProductReview, User } from "@prisma/client";
import { StarRating } from "@/components/storefront/StarRating";
import { formatReviewerName } from "@/lib/review-utils";

type ReviewWithUser = ProductReview & {
  user: Pick<User, "id" | "name">;
};

type ReviewListProps = {
  reviews: ReviewWithUser[];
  currentUserId?: string;
};

export function ReviewList({ reviews, currentUserId }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-navy/55">
        No reviews yet. Be the first to share your experience.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-navy/8">
      {reviews.map((review) => {
        const isOwn = currentUserId === review.userId;
        return (
          <li key={review.id} className="py-5 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-center gap-3">
              <StarRating rating={review.rating} />
              <span className="text-sm font-medium text-navy">
                {formatReviewerName(review.user.name)}
                {isOwn ? " (You)" : ""}
              </span>
              <span className="rounded-full bg-mint/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-navy/70">
                Verified purchaser
              </span>
              <span className="text-xs text-navy/45">
                {format(review.createdAt, "MMM d, yyyy")}
              </span>
            </div>
            {review.title && (
              <p className="mt-2 font-display text-base font-bold text-navy">
                {review.title}
              </p>
            )}
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-navy/70">
              {review.body}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
