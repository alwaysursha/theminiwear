"use client";

import { ChevronDown } from "lucide-react";
import { useAccountPanelStore } from "@/lib/account-panel-store";
import { cn } from "@/lib/utils";

/** Tooltip only — no duplicate arrow below the account button. */
export function AccountLoginHint() {
  const showLoginHint = useAccountPanelStore((s) => s.showLoginHint);
  const hintMessageVisible = useAccountPanelStore((s) => s.hintMessageVisible);
  const isOpen = useAccountPanelStore((s) => s.isOpen);

  if (!showLoginHint || isOpen || !hintMessageVisible) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-[calc(100%+6px)] z-50 -translate-x-1/2"
      role="status"
    >
      <div className="account-hint-message whitespace-nowrap rounded-full border border-coral/30 bg-white px-4 py-2 text-xs font-semibold text-navy shadow-[0_10px_30px_rgba(255,127,110,0.28)]">
        Click to view dashboard
      </div>
    </div>
  );
}

export function AccountOpenChevron({
  highlighted = false,
  panelOpen = false,
  className,
}: {
  highlighted?: boolean;
  panelOpen?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex h-5 w-5 shrink-0 items-center justify-center",
        highlighted && "account-chevron-highlight",
      )}
      aria-hidden
    >
      <ChevronDown
        className={cn(
          "h-4 w-4 text-coral transition-transform duration-500",
          !panelOpen && "account-chevron-bob",
          panelOpen && "rotate-180",
          className,
        )}
        strokeWidth={2.5}
      />
    </span>
  );
}
