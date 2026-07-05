import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/date";
import { ArrowLeft, Headset, Send, UserRound } from "lucide-react";
import { InquiryStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InquiryAdminControls } from "@/components/admin/inquiries/InquiryAdminControls";
import { replyToInquiry } from "@/lib/actions/inquiries";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<InquiryStatus, string> = {
  OPEN: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-sky-100 text-sky-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-slate-100 text-slate-500",
};

export default async function AdminInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    include: {
      user: true,
      assignee: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!inquiry) {
    notFound();
  }

  const staff = await prisma.user.findMany({
    where: { role: { in: [Role.ADMIN, Role.ORDER_MANAGER, Role.SUPPORT_AGENT] } },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  const boundReply = replyToInquiry.bind(null, id);
  const fromName =
    inquiry.user?.name ??
    inquiry.guestName ??
    inquiry.guestEmail ??
    "Unknown";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/inquiries"
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to inquiries
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {inquiry.subject}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              From {fromName}
              {inquiry.assignee?.name
                ? ` · Assigned to ${inquiry.assignee.name}`
                : ""}
            </p>
          </div>
          <span
            className={cn(
              "inline-flex w-fit items-center rounded-full px-3 py-1 text-sm font-semibold",
              STATUS_STYLES[inquiry.status],
            )}
          >
            {inquiry.status.replace("_", " ")}
          </span>
        </div>
      </div>

      <InquiryAdminControls
        inquiryId={inquiry.id}
        status={inquiry.status}
        assigneeId={inquiry.assigneeId}
        staff={staff}
      />

      {/* Thread */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="space-y-4">
          {inquiry.messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.isStaff && "flex-row-reverse",
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  message.isStaff
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-500",
                )}
              >
                {message.isStaff ? (
                  <Headset className="h-4 w-4" />
                ) : (
                  <UserRound className="h-4 w-4" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3",
                  message.isStaff
                    ? "rounded-tr-sm bg-slate-900 text-white"
                    : "rounded-tl-sm border border-slate-200 bg-slate-50 text-slate-700",
                )}
              >
                <div
                  className={cn(
                    "mb-1 flex items-center gap-2 text-xs",
                    message.isStaff ? "text-white/60" : "text-slate-400",
                  )}
                >
                  <span className="font-semibold">
                    {message.isStaff ? "Staff" : fromName}
                  </span>
                  <span>·</span>
                  <span>{formatDate(message.createdAt, "MMM d, h:mm a")}</span>
                </div>
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reply */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
          <Send className="h-4 w-4 text-slate-400" />
          Reply
        </h3>
        <form action={boundReply} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Message</Label>
            <Textarea
              id="content"
              name="content"
              required
              rows={4}
              placeholder="Type your reply…"
              className="rounded-lg border-slate-200"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2 sm:w-64">
              <Label htmlFor="status">Update status (optional)</Label>
              <select
                id="status"
                name="status"
                defaultValue=""
                className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="">Keep current</option>
                {Object.values(InquiryStatus).map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="submit"
              className="rounded-lg bg-slate-900 text-white hover:bg-slate-800"
            >
              <Send className="h-4 w-4" />
              Send reply
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
