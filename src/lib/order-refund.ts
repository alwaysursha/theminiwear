/** Amount to refund for products only — excludes shipping and tax. */
export function productRefundAmount(order: {
  subtotal: number | string | { toString(): string };
  discountAmount?: number | string | { toString(): string } | null;
}) {
  const subtotal = Number(order.subtotal);
  const discount = Number(order.discountAmount ?? 0);
  return Math.max(0, subtotal - discount);
}
