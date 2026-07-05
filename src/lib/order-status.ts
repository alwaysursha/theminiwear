import { OrderStatus } from "@prisma/client";

/** Orders that count toward revenue and customer lifetime value. */
export const PAID_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

export const paidOrderWhere = {
  status: { in: PAID_ORDER_STATUSES },
};
