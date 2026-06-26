import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
};

export function StatCard({
  title,
  value,
  subtitle,
  description,
  icon: Icon,
  className,
}: StatCardProps) {
  const detail = subtitle ?? description;
  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          {detail ? (
            <p className="mt-1 text-xs text-slate-400">{detail}</p>
          ) : null}
        </div>
        {Icon ? (
          <div className="rounded-lg bg-slate-100 p-2.5">
            <Icon className="h-5 w-5 text-slate-600" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
