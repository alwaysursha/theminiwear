import Link from "next/link";

export function OrderDetailPageHeader({
  orderNumber,
  placedAt,
}: {
  orderNumber: string;
  placedAt: string;
}) {
  return (
    <div>
      <Link
        href="/"
        className="text-sm font-semibold text-coral hover:underline"
      >
        ← Back to Home
      </Link>
      <div className="mt-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-coral/80">
          Order Details
        </p>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-navy sm:text-3xl">
          Order {orderNumber}
        </h1>
        <p className="mt-1 text-sm text-navy/60">Placed {placedAt}</p>
      </div>
    </div>
  );
}
