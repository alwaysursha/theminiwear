import { create } from "zustand";

export type CartCelebration = {
  id: string;
  name: string;
  image?: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  fromX: number;
  fromY: number;
};

type CartUiState = {
  celebration: CartCelebration | null;
  cartPulse: boolean;
  showCelebration: (payload: Omit<CartCelebration, "id">) => void;
  dismissCelebration: () => void;
  setCartPulse: (active: boolean) => void;
};

export const useCartUiStore = create<CartUiState>((set) => ({
  celebration: null,
  cartPulse: false,
  showCelebration: (payload) =>
    set({
      celebration: {
        ...payload,
        id: `${payload.name}-${Date.now()}`,
      },
    }),
  dismissCelebration: () => set({ celebration: null }),
  setCartPulse: (active) => set({ cartPulse: active }),
}));
