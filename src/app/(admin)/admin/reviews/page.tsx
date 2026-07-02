import {
  CheckCircle2,
  Clock,
  MessageSquare,
  Star,
  XCircle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatReviewerName } from "@/lib/review-utils";
import { MetricCard } from "@/components/admin/dashboard/MetricCard";
import {
  ReviewsManager,
  type AdminReviewRow,
  type ReviewStatusValue,
} from "@/components/admin/reviews/ReviewsManager";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await prisma.productReview.findMany({
    include: {
      user: true,
      product: true,
      order: true,
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const rows: AdminReviewRow[] = reviews.map((review) => ({
    id: review.id,
    productName: review.product.name,
    customerName:
      formatReviewerName(review.user.name) ||
      review.user.email ||
      "Customer",
    rating: review.rating,
    status: review.status as ReviewStatusValue,
    title: review.title,
    body: review.body,
    orderId: review.order.id,
    orderNumber: review.order.orderNumber,
    createdAt: review.createdAt.toISOString(),
  }));

  const stats = {
    total: rows.length,
    pending: rows.filter((r) => r.status === "PENDING").length,
    approved: rows.filter((r) => r.status === "APPROVED").length,
    rejected: rows.filter((r) => r.status === "REJECTED").length,
    average:
      rows.length > 0
        ? (rows.reduce((sum, r) => sum + r.rating, 0) / rows.length).toFixed(1)
        : "—",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Reviews
        </h2>
        <p className="text-sm text-slate-500">
          Moderate customer product reviews
          {stats.pending > 0 ? ` · ${stats.pending} awaiting moderation` : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard
          label="Total reviews"
          value={stats.total}
          icon={MessageSquare}
          accent="blue"
        />
        <MetricCard
          label="Pending"
          value={stats.pending}
          icon={Clock}
          accent="amber"
          sub="Awaiting moderation"
        />
        <MetricCard
          label="Approved"
          value={stats.approved}
          icon={CheckCircle2}
          accent="emerald"
        />
        <MetricCard
          label="Rejected"
          value={stats.rejected}
          icon={XCircle}
          accent="rose"
        />
        <MetricCard
          label="Avg rating"
          value={stats.average}
          icon={Star}
          accent="violet"
          sub="Across all reviews"
        />
      </div>

      <ReviewsManager reviews={rows} />
    </div>
  );
}
