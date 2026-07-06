"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDate } from "@/lib/date";
import { fetchAccountPanelMessages } from "@/lib/actions/account-panel";
import {
  AccountPanelCard,
  AccountPanelEmpty,
  AccountPanelHeader,
  AccountPanelLink,
  AccountPanelSkeleton,
  AccountPanelStatus,
} from "@/components/storefront/panel/account-panel-ui";

type MessagesData = Awaited<ReturnType<typeof fetchAccountPanelMessages>>;

export function AccountPanelMessages({
  refreshKey,
}: {
  refreshKey: number;
}) {
  const [data, setData] = useState<MessagesData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchAccountPanelMessages();
    setData(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  if (loading) {
    return <AccountPanelSkeleton />;
  }

  if (!data || "error" in data) {
    return (
      <p className="account-panel-muted py-6 text-center text-xs">
        Could not load messages.
      </p>
    );
  }

  const { inquiries } = data;

  return (
    <>
      <AccountPanelHeader
        title="Messages"
        subtitle="Support conversations"
        action={
          <AccountPanelLink href="/contact">New message</AccountPanelLink>
        }
      />

      {inquiries.length === 0 ? (
        <AccountPanelEmpty
          message="No messages yet"
          actionLabel="Contact us"
          actionHref="/contact"
        />
      ) : (
        <div className="space-y-2">
          {inquiries.map((inquiry) => (
            <AccountPanelCard
              key={inquiry.id}
              href={`/account/inquiries/${inquiry.id}`}
              className="p-2.5"
            >
              <div className="relative z-[1] flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {inquiry.subject}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-white/55">
                    {inquiry.preview}
                  </p>
                  <p className="mt-1 text-[10px] text-white/40">
                    Updated {formatDate(inquiry.updatedAt, "MMM d, yyyy")}
                  </p>
                </div>
                <AccountPanelStatus label={inquiry.status} kind="message" />
              </div>
            </AccountPanelCard>
          ))}
        </div>
      )}
    </>
  );
}
