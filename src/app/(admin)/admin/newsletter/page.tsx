import { Mail, UserPlus, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { MetricCard } from "@/components/admin/dashboard/MetricCard";
import {
  NewsletterManager,
  type AdminNewsletterRow,
} from "@/components/admin/newsletter/NewsletterManager";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  const rows: AdminNewsletterRow[] = subscribers.map((row) => ({
    id: row.id,
    email: row.email,
    createdAt: row.createdAt.toISOString(),
  }));

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = rows.filter(
    (row) => new Date(row.createdAt) >= startOfMonth,
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Newsletter
        </h2>
        <p className="text-sm text-slate-500">
          Subscribers from the storefront footer signup
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MetricCard
          label="Subscribers"
          value={rows.length}
          icon={Users}
          accent="blue"
        />
        <MetricCard
          label="New this month"
          value={newThisMonth}
          icon={UserPlus}
          accent="emerald"
        />
        <MetricCard
          label="List"
          value="Active"
          icon={Mail}
          accent="violet"
        />
      </div>

      <NewsletterManager subscribers={rows} />
    </div>
  );
}
