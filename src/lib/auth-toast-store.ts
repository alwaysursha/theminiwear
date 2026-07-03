import { create } from "zustand";

export type AuthToastKind = "signed-in" | "signed-up" | "signed-out";

export type AuthToast = {
  id: string;
  kind: AuthToastKind;
  firstName?: string | null;
  /** Screen coords of the element to fly from (welcome toasts only). */
  fromX?: number;
  fromY?: number;
};

type AuthToastState = {
  toast: AuthToast | null;
  accountPulse: boolean;
  showAuthToast: (payload: Omit<AuthToast, "id">) => void;
  dismissAuthToast: () => void;
  setAccountPulse: (active: boolean) => void;
};

export const useAuthToastStore = create<AuthToastState>((set) => ({
  toast: null,
  accountPulse: false,
  showAuthToast: (payload) =>
    set({ toast: { ...payload, id: `${payload.kind}-${Date.now()}` } }),
  dismissAuthToast: () => set({ toast: null }),
  setAccountPulse: (active) => set({ accountPulse: active }),
}));

/** First word of a display name, e.g. "Faiza Farooq" -> "Faiza". */
export function firstNameOf(name?: string | null): string | null {
  const trimmed = name?.trim();
  if (!trimmed) return null;
  return trimmed.split(/\s+/)[0];
}
