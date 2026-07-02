import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export type RevenueDay = {
  label: string;
  value: number;
  isToday: boolean;
};

export function RevenueBars({ days }: { days: RevenueDay[] }) {
  const max = Math.max(1, ...days.map((d) => d.value));

  return (
    <div className="flex h-44 items-stretch gap-2 sm:gap-3">
      {days.map((day, i) => {
        const heightPct = day.value > 0 ? Math.max(6, (day.value / max) * 100) : 2;
        return (
          <div key={i} className="group flex flex-1 flex-col items-center gap-2">
            <div className="relative flex w-full flex-1 items-end">
              <div className="pointer-events-none absolute inset-x-0 -top-1 z-10 flex justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <span className="whitespace-nowrap rounded-md bg-slate-900 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                  {formatPrice(day.value)}
                </span>
              </div>
              <div
                className={cn(
                  "w-full rounded-t-lg bg-gradient-to-t transition-all duration-500 ease-out",
                  day.isToday
                    ? "from-indigo-500 to-violet-400"
                    : "from-slate-300 to-slate-200 group-hover:from-indigo-400 group-hover:to-violet-300",
                )}
                style={{ height: `${heightPct}%` }}
              />
            </div>
            <span
              className={cn(
                "text-[11px]",
                day.isToday ? "font-bold text-slate-900" : "text-slate-400",
              )}
            >
              {day.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
