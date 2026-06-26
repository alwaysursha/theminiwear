import Link from "next/link";
import { format } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const statusVariant: Record<
  string,
  "default" | "new" | "trending" | "success" | "warning"
> = {
  OPEN: "trending",
  IN_PROGRESS: "new",
  RESOLVED: "success",
  CLOSED: "default",
};

export default async function InquiriesPage() {
  const session = await auth();
  const inquiries = await prisma.inquiry.findMany({
    where: { userId: session!.user.id },
    orderBy: { updatedAt: "desc" },
    include: { messages: { take: 1, orderBy: { createdAt: "desc" } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-navy">
            Inquiries
          </h1>
          <p className="mt-1 text-sm text-navy/60">
            Your support conversations
          </p>
        </div>
        <Link
          href="/contact"
          className="text-sm font-semibold text-coral hover:underline"
        >
          New inquiry
        </Link>
      </div>

      {inquiries.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-navy/20 bg-blush/20 py-16 text-center">
          <p className="text-navy/60">No inquiries yet</p>
          <Link
            href="/contact"
            className="mt-2 inline-block text-sm font-semibold text-coral hover:underline"
          >
            Contact us
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {inquiries.map((inquiry) => (
            <Link
              key={inquiry.id}
              href={`/account/inquiries/${inquiry.id}`}
              className="block rounded-2xl border border-navy/10 bg-white p-5 shadow-sm transition-colors hover:border-coral/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-navy">{inquiry.subject}</p>
                  <p className="mt-1 line-clamp-1 text-sm text-navy/60">
                    {inquiry.messages[0]?.content ?? "No messages"}
                  </p>
                  <p className="mt-2 text-xs text-navy/40">
                    Updated {format(inquiry.updatedAt, "MMM d, yyyy")}
                  </p>
                </div>
                <Badge variant={statusVariant[inquiry.status] ?? "default"}>
                  {inquiry.status.replace("_", " ")}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
