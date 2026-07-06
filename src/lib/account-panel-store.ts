import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AccountPanelSection =
  | "orders"
  | "wishlist"
  | "addresses"
  | "messages"
  | "profile";

type AccountPanelState = {
  isOpen: boolean;
  activeSection: AccountPanelSection;
  showLoginHint: boolean;
  hintMessageVisible: boolean;
  open: (section?: AccountPanelSection) => void;
  close: () => void;
  toggle: (section?: AccountPanelSection) => void;
  setSection: (section: AccountPanelSection) => void;
  showPostLoginHint: () => void;
  dismissLoginHint: () => void;
};

let hintMessageTimer: ReturnType<typeof setTimeout> | null = null;

export const useAccountPanelStore = create<AccountPanelState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      activeSection: "orders",
      showLoginHint: false,
      hintMessageVisible: false,

      open: (section) => {
        if (hintMessageTimer) {
          clearTimeout(hintMessageTimer);
          hintMessageTimer = null;
        }
        set({
          isOpen: true,
          showLoginHint: false,
          hintMessageVisible: false,
          ...(section ? { activeSection: section } : {}),
        });
      },

      close: () => {
        set({ isOpen: false, showLoginHint: false, hintMessageVisible: false });
      },

      toggle: (section) => {
        const { isOpen } = get();
        if (isOpen) {
          get().close();
          return;
        }
        get().open(section);
      },

      setSection: (section) => set({ activeSection: section }),

      showPostLoginHint: () => {
        if (hintMessageTimer) {
          clearTimeout(hintMessageTimer);
        }
        set({ showLoginHint: true, hintMessageVisible: true });
        hintMessageTimer = setTimeout(() => {
          set({ hintMessageVisible: false });
          hintMessageTimer = null;
        }, 3000);
      },

      dismissLoginHint: () => {
        if (hintMessageTimer) {
          clearTimeout(hintMessageTimer);
          hintMessageTimer = null;
        }
        set({ showLoginHint: false, hintMessageVisible: false });
      },
    }),
    {
      name: "mw-account-panel",
      partialize: (state) => ({
        isOpen: state.isOpen,
        activeSection: state.activeSection,
      }),
    },
  ),
);
