import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "slate" | "blue" | "amber" | "rose" | "emerald";

const TONES: Record<Tone, string> = {
  slate: "bg-slate-100 text-slate-600",
  blue: "bg-sky-100 text-sky-700",
  amber: "bg-amber-100 text-amber-700",
  rose: "bg-rose-100 text-rose-700",
  emerald: "bg-emerald-100 text-emerald-700",
};

type DashboardPanelProps = {
  title: string;
  icon?: LucideIcon;
  count?: number;
  countTone?: Tone;
  action?: { href: string; label: string };
  children: ReactNode;
  className?: string;
};

export function DashboardPanel({
  title,
  icon: Icon,
  count,
  countTone = "slate",
  action,
  children,
  className,
}: DashboardPanelProps) {
  return (
    <section
      className={cn(
        "dash-rise flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className="rounded-lg bg-slate-100 p-2 text-slate-600">
              <Icon className="h-4 w-4" />
            </span>
          )}
          <h3 className="font-semibold text-slate-900">{title}</h3>
          {count != null && (
            <span
              className={cn(
                "min-w-5 rounded-full px-1.5 py-0.5 text-center text-xs font-bold",
                TONES[countTone],
              )}
            >
              {count}
            </span>
          )}
        </div>
        {action && (
          <Link
            href={action.href}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900"
          >
            {action.label}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      <div className="flex-1 p-2.5 sm:p-3">{children}</div>
    </section>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-4 py-10 text-center">
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}
