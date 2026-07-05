import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StarRating } from "@/components/storefront/StarRating";
import { formatReviewerName } from "@/lib/review-utils";
import {
  ReviewEditForm,
  ReviewModerationActions,
} from "@/components/admin/reviews/ReviewDetailActions";
import { DeleteReviewButton } from "@/components/admin/reviews/DeleteReviewButton";

export const dynamic = "force-dynamic";

export default async function AdminReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const review = await prisma.productReview.findUnique({
    where: { id },
    include: {
      user: true,
      product: true,
      order: true,
      moderatedBy: true,
    },
  });

  if (!review) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/reviews"
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to reviews
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Review for {review.product.name}
            </h2>
            <p className="text-sm text-slate-500">
              By {formatReviewerName(review.user.name)} · Order{" "}
              <Link
                href={`/admin/orders/${review.order.id}`}
                className="text-slate-700 hover:underline"
              >
                {review.order.orderNumber}
              </Link>
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              review.status === "PENDING"
                ? "bg-amber-100 text-amber-800"
                : review.status === "APPROVED"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {review.status}
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <StarRating rating={review.rating} />
          <span className="text-sm text-slate-500">
            Submitted {format(review.createdAt, "MMM d, yyyy h:mm a")}
          </span>
        </div>
        {review.title && (
          <h3 className="text-lg font-semibold text-slate-900">{review.title}</h3>
        )}
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{review.body}</p>
        {review.moderatedAt && (
          <p className="mt-4 text-xs text-slate-500">
            Last moderated {format(review.moderatedAt, "MMM d, yyyy h:mm a")}
            {review.moderatedBy ? ` by ${review.moderatedBy.name}` : ""}
          </p>
        )}
        {review.rejectionNote && (
          <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            Internal note: {review.rejectionNote}
          </p>
        )}
      </div>

      <ReviewModerationActions reviewId={id} status={review.status} />

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-900">Edit review</h3>
        <ReviewEditForm
          reviewId={id}
          rating={review.rating}
          title={review.title}
          body={review.body}
        />
      </div>

      <DeleteReviewButton reviewId={id} productName={review.product.name} />
    </div>
  );
}
