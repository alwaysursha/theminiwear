import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/admin/DataTable";

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Inquiries</h2>
        <p className="text-sm text-slate-500">Customer support inbox</p>
      </div>

      <DataTable
        data={inquiries}
        getRowKey={(inquiry) => inquiry.id}
        columns={[
          {
            key: "subject",
            header: "Subject",
            render: (inquiry) => (
              <Link
                href={`/admin/inquiries/${inquiry.id}`}
                className="font-medium text-slate-900 hover:underline"
              >
                {inquiry.subject}
              </Link>
            ),
          },
          {
            key: "from",
            header: "From",
            render: (inquiry) =>
              inquiry.user?.name ??
              inquiry.guestName ??
              inquiry.guestEmail ??
              "Unknown",
          },
          {
            key: "status",
            header: "Status",
            render: (inquiry) => (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  inquiry.status === "OPEN"
                    ? "bg-amber-100 text-amber-800"
                    : inquiry.status === "RESOLVED"
                      ? "bg-green-100 text-green-800"
                      : "bg-slate-100 text-slate-700"
                }`}
              >
                {inquiry.status.replace("_", " ")}
              </span>
            ),
          },
          {
            key: "assignee",
            header: "Assignee",
            render: (inquiry) => inquiry.assignee?.name ?? "—",
          },
          {
            key: "messages",
            header: "Messages",
            render: (inquiry) => inquiry._count.messages,
          },
          {
            key: "updatedAt",
            header: "Updated",
            render: (inquiry) => format(inquiry.updatedAt, "MMM d, yyyy"),
          },
        ]}
      />
    </div>
  );
}
