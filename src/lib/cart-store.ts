import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildCustomLineId,
  type CustomMeasurements,
} from "@/lib/custom-size";

export type CartItemCustom = {
  fee: number;
  measurements: CustomMeasurements;
};

export type CartItem = {
  /** Stable identity for this cart line (variantId for standard items). */
  lineId: string;
  variantId: string;
  productId: string;
  name: string;
  size: string;
  color: string;
  /** Per-unit price actually charged, already including any custom fee. */
  price: number;
  image?: string;
  quantity: number;
  stock: number;
  /** Present when this is a made-to-measure (custom fit) line. */
  custom?: CartItemCustom;
};

type AddItemInput = Omit<CartItem, "quantity" | "lineId"> & {
  quantity?: number;
  lineId?: string;
};

type CartState = {
  items: CartItem[];
  addItem: (item: AddItemInput) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
};

function resolveLineId(item: AddItemInput): string {
  if (item.lineId) return item.lineId;
  if (item.custom) return buildCustomLineId(item.variantId, item.custom.measurements);
  return item.variantId;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const quantity = item.quantity ?? 1;
        const lineId = resolveLineId(item);
        set((state) => {
          const existing = state.items.find((i) => i.lineId === lineId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.lineId === lineId
                  ? { ...i, quantity: Math.min(i.quantity + quantity, i.stock) }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { ...item, lineId, quantity: Math.min(quantity, item.stock) },
            ],
          };
        });
      },
      removeItem: (lineId) =>
        set((state) => ({
          items: state.items.filter((i) => i.lineId !== lineId),
        })),
      updateQuantity: (lineId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.lineId === lineId
                ? { ...i, quantity: Math.min(Math.max(1, quantity), i.stock) }
                : i,
            )
            .filter((i) => i.quantity > 0),
        })),
      clearCart: () => set({ items: [] }),
      getTotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "kids-cart",
      version: 1,
      migrate: (persisted, version) => {
        const state = persisted as { items?: CartItem[] } | undefined;
        if (state?.items && version < 1) {
          state.items = state.items.map((i) => ({
            ...i,
            lineId: i.lineId ?? i.variantId,
          }));
        }
        return state as CartState;
      },
    },
  ),
);
