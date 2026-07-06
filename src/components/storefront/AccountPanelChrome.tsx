"use client";

import type { ReactNode } from "react";
import { useAccountPanelStore } from "@/lib/account-panel-store";
import { cn } from "@/lib/utils";

export function AccountLayoutShell({ children }: { children: ReactNode }) {
  const isOpen = useAccountPanelStore((s) => s.isOpen);

  return (
    <div
      className={cn(
        "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
        isOpen ? "pb-6 pt-2" : "py-6",
      )}
    >
      {children}
    </div>
  );
}

export function AccountChromeHidden({ children }: { children: ReactNode }) {
  const isOpen = useAccountPanelStore((s) => s.isOpen);
  if (isOpen) {
    return null;
  }
  return <>{children}</>;
}
