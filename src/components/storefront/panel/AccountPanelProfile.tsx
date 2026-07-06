"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchAccountPanelProfile } from "@/lib/actions/account-panel";
import { useAccountPanelStore } from "@/lib/account-panel-store";
import { ProfileForm } from "@/components/storefront/ProfileForm";
import {
  AccountPanelHeader,
  AccountPanelSkeleton,
} from "@/components/storefront/panel/account-panel-ui";

type ProfileData = Awaited<ReturnType<typeof fetchAccountPanelProfile>>;

export function AccountPanelProfile({
  refreshKey,
}: {
  refreshKey: number;
}) {
  const closePanel = useAccountPanelStore((s) => s.close);
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchAccountPanelProfile();
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
        Could not load profile.
      </p>
    );
  }

  return (
    <>
      <AccountPanelHeader
        title="Profile"
        subtitle="Account details"
      />
      <div className="account-panel-form-card">
        <ProfileForm
          variant="panel"
          name={data.name}
          email={data.email}
          phone={data.phone}
          onSignOut={closePanel}
        />
      </div>
    </>
  );
}
