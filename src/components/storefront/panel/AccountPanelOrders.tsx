"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { formatDate } from "@/lib/date";
import { fetchAccountPanelOrders } from "@/lib/actions/account-panel";
import { useAccountPanelStore } from "@/lib/account-panel-store";
import { formatPrice } from "@/lib/utils";
import {
  AccountPanelCard,
  AccountPanelEmpty,
  AccountPanelHeader,
  AccountPanelNotice,
  AccountPanelSkeleton,
  AccountPanelStatus,
} from "@/components/storefront/panel/account-panel-ui";

type OrdersData = Awaited<ReturnType<typeof fetchAccountPanelOrders>>;

export function AccountPanelOrders({
  refreshKey,
}: {
  refreshKey: number;
}) {
  const setSection = useAccountPanelStore((s) => s.setSection);
  const [data, setData] = useState<OrdersData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchAccountPanelOrders();
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
        Could not load orders.
      </p>
    );
  }

  const { orders, openInquiries } = data;

  return (
    <>
      <AccountPanelHeader
        title="Orders"
        subtitle={`${orders.length} order${orders.length !== 1 ? "s" : ""}`}
      />

      {openInquiries > 0 && (
        <AccountPanelNotice>
          You have {openInquiries} open message{openInquiries !== 1 ? "s" : ""}.{" "}
          <button
            type="button"
            onClick={() => setSection("messages")}
            className="font-semibold text-[#ff9d70] hover:underline"
          >
            View messages
          </button>
        </AccountPanelNotice>
      )}

      {orders.length === 0 ? (
        <AccountPanelEmpty
          message="No orders yet"
          actionLabel="Browse the shop"
          actionHref="/shop"
        />
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <AccountPanelCard
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="flex gap-3 p-2.5"
            >
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-white/10">
                {order.leadImageUrl ? (
                  <Image
                    src={order.leadImageUrl}
                    alt={order.leadProductName}
                    fill
                    className="object-cover"
                    sizes="44px"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm">
                    👕
                  </div>
                )}
              </div>
              <div className="relative z-[1] min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {order.leadProductName}
                    </p>
                    <p className="text-[10px] text-white/45">{order.orderNumber}</p>
                    <p className="mt-0.5 text-[11px] text-white/55">
                      {formatDate(order.createdAt, "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <AccountPanelStatus label={order.status} kind="order" />
                    <p className="text-sm font-bold text-[#ff9d70]">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </div>
              </div>
            </AccountPanelCard>
          ))}
        </div>
      )}
    </>
  );
}
