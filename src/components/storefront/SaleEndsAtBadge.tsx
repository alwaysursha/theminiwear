"use client";

import { Clock } from "lucide-react";
import { formatSaleEndsLabel } from "@/lib/sale-expiry";
import { cn } from "@/lib/utils";

export function SaleEndsAtBadge({
  endsAt,
  className,
  variant = "overlay",
}: {
  endsAt: Date;
  className?: string;
  variant?: "overlay" | "inline";
}) {
  const label = formatSaleEndsLabel(endsAt);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-bold uppercase tracking-wide text-white relative overflow-hidden",
        variant === "overlay"
          ? "absolute bottom-2 left-2 z-20 rounded-full bg-gradient-to-r from-rose-600 via-red-500 to-orange-500 px-2.5 py-1 text-[10px] shadow-[0_4px_16px_rgba(220,38,38,0.45)] ring-2 ring-white/30 sm:bottom-3 sm:left-3 sm:px-3 sm:py-1.5 sm:text-[11px]"
          : "rounded-full bg-gradient-to-r from-rose-600 via-red-500 to-orange-500 px-3 py-1.5 text-[11px] shadow-md ring-1 ring-rose-300/50 sm:text-xs",
        className,
      )}
    >
      <span
        className="absolute inset-0 animate-ping rounded-full bg-white/20 opacity-75"
        aria-hidden
      />
      <Clock className="relative h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden />
      <span className="relative">{label}</span>
    </span>
  );
}
