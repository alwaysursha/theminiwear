import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/admin/DataTable";
import { StarRating } from "@/components/storefront/StarRating";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const [reviews, pendingCount] = await Promise.all([
    prisma.productReview.findMany({
      include: {
        user: true,
        product: true,
        order: true,
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
    prisma.productReview.count({ where: { status: "PENDING" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Reviews</h2>
        <p className="text-sm text-slate-500">
          Moderate customer product reviews
          {pendingCount > 0 ? ` · ${pendingCount} pending` : ""}
        </p>
      </div>

      <DataTable
        data={reviews}
        getRowKey={(review) => review.id}
        emptyMessage="No reviews yet."
        columns={[
          {
            key: "product",
            header: "Product",
            render: (review) => (
              <Link
                href={`/admin/reviews/${review.id}`}
                className="font-medium text-slate-900 hover:underline"
              >
                {review.product.name}
              </Link>
            ),
          },
          {
            key: "customer",
            header: "Customer",
            render: (review) => review.user.name ?? review.user.email,
          },
          {
            key: "rating",
            header: "Rating",
            render: (review) => <StarRating rating={review.rating} size="sm" />,
          },
          {
            key: "status",
            header: "Status",
            render: (review) => (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  review.status === "PENDING"
                    ? "bg-amber-100 text-amber-800"
                    : review.status === "APPROVED"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {review.status}
              </span>
            ),
          },
          {
            key: "order",
            header: "Order",
            render: (review) => (
              <Link
                href={`/admin/orders/${review.order.id}`}
                className="text-slate-700 hover:underline"
              >
                {review.order.orderNumber}
              </Link>
            ),
          },
          {
            key: "submitted",
            header: "Submitted",
            render: (review) => format(review.createdAt, "MMM d, yyyy"),
          },
        ]}
      />
    </div>
  );
}
