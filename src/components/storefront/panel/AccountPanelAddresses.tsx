"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchAccountPanelAddresses } from "@/lib/actions/account-panel";
import { AddressesManager } from "@/components/storefront/AddressesManager";
import {
  AccountPanelHeader,
  AccountPanelSkeleton,
} from "@/components/storefront/panel/account-panel-ui";

type AddressesData = Awaited<ReturnType<typeof fetchAccountPanelAddresses>>;

export function AccountPanelAddresses({
  refreshKey,
}: {
  refreshKey: number;
}) {
  const [data, setData] = useState<AddressesData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchAccountPanelAddresses();
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
        Could not load addresses.
      </p>
    );
  }

  return (
    <>
      <AccountPanelHeader
        title="Addresses"
        subtitle="Shipping destinations"
      />
      <AddressesManager
        variant="panel"
        addresses={data.addresses}
        onMutate={() => void load()}
      />
    </>
  );
}
