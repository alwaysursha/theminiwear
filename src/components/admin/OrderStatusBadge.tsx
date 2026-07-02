import { OrderStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const STYLES: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-slate-100 text-slate-600" },
  PAID: { label: "Paid", className: "bg-emerald-100 text-emerald-700" },
  PROCESSING: { label: "Processing", className: "bg-sky-100 text-sky-700" },
  SHIPPED: { label: "Shipped", className: "bg-violet-100 text-violet-700" },
  DELIVERED: { label: "Delivered", className: "bg-teal-100 text-teal-700" },
  CANCELLED: { label: "Cancelled", className: "bg-slate-200 text-slate-500" },
  REFUNDED: { label: "Refunded", className: "bg-rose-100 text-rose-700" },
};

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  const style = STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        style.className,
        className,
      )}
    >
      {style.label}
    </span>
  );
}
