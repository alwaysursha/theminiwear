"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAccountPanelStore } from "@/lib/account-panel-store";
import { isAdminRole } from "@/lib/constants";
import { AccountSlidePanel } from "@/components/storefront/AccountSlidePanel";
import { cn } from "@/lib/utils";

export function AccountPanelHost({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const isOpen = useAccountPanelStore((s) => s.isOpen);
  const close = useAccountPanelStore((s) => s.close);

  const isCustomer =
    status === "authenticated" &&
    session?.user?.role &&
    !isAdminRole(session.user.role);

  useEffect(() => {
    if (status === "unauthenticated") {
      close();
    }
  }, [status, close]);

  if (!isCustomer) {
    return <>{children}</>;
  }

  return (
    <>
      <AccountSlidePanel />
      <div
        className={cn(
          "account-site-content transition-[transform,filter] duration-[620ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[transform,filter]",
          isOpen && "account-site-content--panel-open",
        )}
      >
        {children}
      </div>
    </>
  );
}
