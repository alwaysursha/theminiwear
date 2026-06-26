import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { InquiryStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { replyToInquiry } from "@/lib/actions/inquiries";

export const dynamic = "force-dynamic";

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

  const boundReply = replyToInquiry.bind(null, id);

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
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              {inquiry.subject}
            </h2>
            <p className="text-sm text-slate-500">
              From{" "}
              {inquiry.user?.name ??
                inquiry.guestName ??
                inquiry.guestEmail ??
                "Unknown"}
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            {inquiry.status.replace("_", " ")}
          </span>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        {inquiry.messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-lg p-4 ${
              message.isStaff
                ? "ml-8 bg-slate-100"
                : "mr-8 border border-slate-100 bg-white"
            }`}
          >
            <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">
                {message.isStaff ? "Staff" : "Customer"}
              </span>
              <span>{format(message.createdAt, "MMM d, yyyy h:mm a")}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm text-slate-700">
              {message.content}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-900">Reply</h3>
        <form action={boundReply} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Message</Label>
            <Textarea
              id="content"
              name="content"
              required
              placeholder="Type your reply..."
              className="rounded-md border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Update status (optional)</Label>
            <select
              id="status"
              name="status"
              defaultValue=""
              className="flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
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
            className="rounded-md bg-slate-900 text-white hover:bg-slate-800"
          >
            Send reply
          </Button>
        </form>
      </div>
    </div>
  );
}
