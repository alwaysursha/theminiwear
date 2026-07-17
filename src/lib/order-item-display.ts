/** Display helpers for order lines after a product/variant may have been deleted. */

type OrderItemLabelSource = {
  productName?: string | null;
  variantLabel?: string | null;
  variant?: {
    size: string;
    color: string;
    ageGroup?: string;
    product?: { name: string } | null;
  } | null;
};

export function orderItemProductName(item: OrderItemLabelSource) {
  return item.variant?.product?.name ?? item.productName ?? "Deleted product";
}

export function orderItemVariantLabel(
  item: OrderItemLabelSource,
  options?: { includeAgeGroup?: boolean },
) {
  if (item.variant) {
    const parts = [item.variant.size, item.variant.color];
    if (options?.includeAgeGroup && item.variant.ageGroup) {
      parts.push(item.variant.ageGroup);
    }
    return parts.join(" / ");
  }
  return item.variantLabel ?? "Variant removed";
}
