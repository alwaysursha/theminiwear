import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Accent = "emerald" | "blue" | "violet" | "amber" | "rose" | "slate";

const ACCENTS: Record<
  Accent,
  { bar: string; iconBg: string; iconText: string }
> = {
  emerald: {
    bar: "from-emerald-400 to-teal-500",
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
  },
  blue: {
    bar: "from-sky-400 to-blue-500",
    iconBg: "bg-sky-50",
    iconText: "text-sky-600",
  },
  violet: {
    bar: "from-violet-400 to-purple-500",
    iconBg: "bg-violet-50",
    iconText: "text-violet-600",
  },
  amber: {
    bar: "from-amber-400 to-orange-500",
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
  },
  rose: {
    bar: "from-rose-400 to-pink-500",
    iconBg: "bg-rose-50",
    iconText: "text-rose-600",
  },
  slate: {
    bar: "from-slate-300 to-slate-400",
    iconBg: "bg-slate-100",
    iconText: "text-slate-600",
  },
};

type MetricCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: Accent;
  sub?: string;
  delta?: { value: string; direction: "up" | "down" | "neutral" };
  href?: string;
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  accent = "slate",
  sub,
  delta,
  href,
}: MetricCardProps) {
  const a = ACCENTS[accent];

  const inner = (
    <div className="dash-rise group relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
          a.bar,
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "shrink-0 rounded-xl p-2.5 transition-transform duration-300 group-hover:scale-110",
            a.iconBg,
            a.iconText,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold",
              delta.direction === "up" && "bg-emerald-50 text-emerald-600",
              delta.direction === "down" && "bg-rose-50 text-rose-600",
              delta.direction === "neutral" && "bg-slate-100 text-slate-500",
            )}
          >
            {delta.direction === "up" && <ArrowUpRight className="h-3 w-3" />}
            {delta.direction === "down" && (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {delta.value}
          </span>
        )}
        {sub && <p className="truncate text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {inner}
      </Link>
    );
  }

  return inner;
}
