import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/date";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { InquiryThread } from "@/components/storefront/InquiryThread";
import { AccountChromeHidden } from "@/components/storefront/AccountPanelChrome";
import { AccountPageHeader } from "@/components/storefront/AccountPageHeader";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function InquiryDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const session = await auth();

  const inquiry = await prisma.inquiry.findFirst({
    where: { id, userId: session!.user.id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!inquiry) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AccountChromeHidden>
        <div>
          <Link
            href="/account/inquiries"
            className="text-sm font-semibold text-coral hover:underline"
          >
            ← Back to messages
          </Link>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <AccountPageHeader
              title={inquiry.subject}
              subtitle={`Opened ${formatDate(inquiry.createdAt, "MMMM d, yyyy")}`}
            />
            <Badge variant={inquiry.status === "RESOLVED" ? "success" : "new"}>
              {inquiry.status.replace("_", " ")}
            </Badge>
          </div>
        </div>
      </AccountChromeHidden>

      <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
        <InquiryThread inquiryId={inquiry.id} messages={inquiry.messages} />
      </div>
    </div>
  );
}
