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

export const AUTH_WELCOME_KEY = "mw-auth-welcome";
export const AUTH_SIGNED_OUT_KEY = "mw-auth-signed-out";

export function markPendingSignedOutToast(firstName?: string | null) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    AUTH_SIGNED_OUT_KEY,
    JSON.stringify({ firstName: firstName ?? null }),
  );
}

export function consumePendingSignedOutToast(): {
  firstName: string | null;
} | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(AUTH_SIGNED_OUT_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(AUTH_SIGNED_OUT_KEY);
  try {
    const parsed = JSON.parse(raw) as { firstName?: string | null };
    return { firstName: parsed.firstName ?? null };
  } catch {
    return { firstName: null };
  }
}

/** First word of a display name, e.g. "Faiza Farooq" -> "Faiza". */
export function firstNameOf(name?: string | null): string | null {
  const trimmed = name?.trim();
  if (!trimmed) return null;
  return trimmed.split(/\s+/)[0];
}
