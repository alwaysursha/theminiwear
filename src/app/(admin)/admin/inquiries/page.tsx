import { CheckCircle2, Clock, Inbox, MailWarning } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { MetricCard } from "@/components/admin/dashboard/MetricCard";
import {
  InquiriesManager,
  type AdminInquiryRow,
  type InquiryStatusValue,
} from "@/components/admin/inquiries/InquiriesManager";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const inquiries = await prisma.inquiry.findMany({
    include: {
      user: true,
      assignee: true,
      messages: { take: 1, orderBy: { createdAt: "desc" } },
      _count: { select: { messages: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const rows: AdminInquiryRow[] = inquiries.map((inquiry) => {
    const last = inquiry.messages[0];
    const status = inquiry.status as InquiryStatusValue;
    const needsReply =
      status !== "RESOLVED" &&
      status !== "CLOSED" &&
      !!last &&
      !last.isStaff;
    return {
      id: inquiry.id,
      subject: inquiry.subject,
      fromName:
        inquiry.user?.name ??
        inquiry.guestName ??
        inquiry.guestEmail ??
        "Unknown",
      status,
      assigneeName: inquiry.assignee?.name ?? null,
      messageCount: inquiry._count.messages,
      preview: last?.content ?? "No messages yet",
      needsReply,
      updatedAt: inquiry.updatedAt.toISOString(),
    };
  });

  const stats = {
    total: rows.length,
    open: rows.filter((r) => r.status === "OPEN").length,
    inProgress: rows.filter((r) => r.status === "IN_PROGRESS").length,
    needsReply: rows.filter((r) => r.needsReply).length,
    resolved: rows.filter((r) => r.status === "RESOLVED").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Inquiries
        </h2>
        <p className="text-sm text-slate-500">
          Customer support inbox
          {stats.needsReply > 0 ? ` · ${stats.needsReply} awaiting reply` : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
        <MetricCard
          label="Total"
          value={stats.total}
          icon={Inbox}
          accent="blue"
        />
        <MetricCard
          label="Awaiting reply"
          value={stats.needsReply}
          icon={MailWarning}
          accent="rose"
          sub="Customer replied last"
        />
        <MetricCard
          label="In progress"
          value={stats.inProgress}
          icon={Clock}
          accent="amber"
        />
        <MetricCard
          label="Resolved"
          value={stats.resolved}
          icon={CheckCircle2}
          accent="emerald"
        />
      </div>

      <InquiriesManager inquiries={rows} />
    </div>
  );
}
