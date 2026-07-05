"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminSaveButton({
  pending,
  saved,
  label,
  savingLabel = "Saving",
  savedLabel = "Saved",
  className,
  size = "default",
  variant = "primary",
}: {
  pending: boolean;
  saved: boolean;
  label: string;
  savingLabel?: string;
  savedLabel?: string;
  className?: string;
  size?: "default" | "sm";
  variant?: "primary" | "outline" | "destructive";
}) {
  const text = pending ? savingLabel : saved ? savedLabel : label;

  return (
    <Button
      type="submit"
      disabled={pending}
      size={size}
      className={cn(
        "transition-colors",
        pending && "border-transparent bg-amber-400 text-slate-900 hover:bg-amber-400",
        !pending &&
          saved &&
          "border-transparent bg-emerald-600 text-white hover:bg-emerald-600",
        !pending &&
          !saved &&
          variant === "primary" &&
          "bg-slate-900 text-white hover:bg-slate-800",
        !pending &&
          !saved &&
          variant === "outline" &&
          "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
        !pending &&
          !saved &&
          variant === "destructive" &&
          "border-transparent bg-rose-600 text-white hover:bg-rose-700",
        className,
      )}
    >
      {text}
    </Button>
  );
}
