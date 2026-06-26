import { cn } from "@/lib/utils";

const variants = {
  default: "bg-navy/10 text-navy",
  new: "bg-mint text-navy",
  trending: "bg-coral/15 text-coral",
  sale: "bg-blush text-navy",
  clearance: "bg-navy text-white",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variants;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
