"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getSaleCountdownParts,
  padCountdownUnit,
  type SaleCountdownParts,
} from "@/lib/sale-expiry";
import { cn } from "@/lib/utils";

function parseEndsAt(endsAt: Date | string): Date {
  return endsAt instanceof Date ? endsAt : new Date(endsAt);
}

function countdownUnits(parts: SaleCountdownParts) {
  const dayDigits = parts.days > 99 ? 3 : 2;

  return [
    { key: "days", value: padCountdownUnit(parts.days, dayDigits), label: "d" },
    { key: "hours", value: padCountdownUnit(parts.hours), label: "h" },
    { key: "minutes", value: padCountdownUnit(parts.minutes), label: "m" },
    { key: "seconds", value: padCountdownUnit(parts.seconds), label: "s" },
  ];
}

function CountdownUnit({
  value,
  label,
  pulse = false,
}: {
  value: string;
  label: string;
  pulse?: boolean;
}) {
  return (
    <div className="flex min-w-[1.55rem] flex-col items-center justify-center rounded-md border border-amber-300/20 bg-black/35 px-1 py-0.5 ring-1 ring-amber-200/15 backdrop-blur-sm sm:min-w-[1.7rem]">
      <span
        className={cn(
          "font-display text-[11px] font-extrabold tabular-nums leading-none text-amber-50 sm:text-xs",
          pulse && "sale-countdown-second",
        )}
      >
        {value}
      </span>
      <span className="mt-px text-[6px] font-semibold uppercase tracking-wide text-amber-200/70">
        {label}
      </span>
    </div>
  );
}

export function SaleCountdownOverlay({
  endsAt,
  className,
}: {
  endsAt: Date | string;
  className?: string;
}) {
  const target = useMemo(() => parseEndsAt(endsAt), [endsAt]);
  const [mounted, setMounted] = useState(false);
  const [parts, setParts] = useState(() => getSaleCountdownParts(target));

  useEffect(() => {
    setMounted(true);

    const tick = () => {
      setParts(getSaleCountdownParts(target));
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  if (parts.expired) {
    return null;
  }

  const units = countdownUnits(parts);
  const urgent = parts.totalMs <= 86_400_000;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 z-20",
        className,
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={cn(
          "relative px-1.5 pb-1.5 pt-4 sm:px-2 sm:pb-2 sm:pt-5",
          urgent
            ? "bg-gradient-to-t from-rose-950/95 via-black/78 to-transparent"
            : "bg-gradient-to-t from-navy/94 via-black/72 to-transparent",
        )}
      >
        <div className="mb-1.5 flex justify-center sm:mb-2">
          <p className="rounded-full bg-black/65 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-white shadow-[0_1px_3px_rgba(0,0,0,0.45)] ring-1 ring-white/20 backdrop-blur-sm sm:px-3 sm:text-xs">
            {mounted ? "Sale ends in" : "Sale ending soon"}
          </p>
        </div>

        {mounted ? (
          <div className="flex items-center justify-center gap-0.5 sm:gap-1">
            {units.map((unit, index) => (
              <div key={unit.key} className="flex items-center gap-0.5 sm:gap-1">
                <CountdownUnit
                  value={unit.value}
                  label={unit.label}
                  pulse={unit.key === "seconds"}
                />
                {index < units.length - 1 && (
                  <span
                    className="pb-2 font-display text-[10px] font-bold leading-none text-amber-200/55 sm:text-[11px]"
                    aria-hidden
                  >
                    :
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-0.5 sm:gap-1">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-0.5 sm:gap-1">
                <CountdownUnit value="--" label="·" />
                {index < 3 && (
                  <span
                    className="pb-2 font-display text-[10px] font-bold leading-none text-amber-200/30 sm:text-[11px]"
                    aria-hidden
                  >
                    :
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
