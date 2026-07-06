"use client";

import {
  Heart,
  HelpCircle,
  MapPin,
  Package,
  User,
  type LucideIcon,
} from "lucide-react";
import {
  useAccountPanelStore,
  type AccountPanelSection,
} from "@/lib/account-panel-store";
import { cn } from "@/lib/utils";

const tabs: {
  id: AccountPanelSection;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "orders", label: "Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "messages", label: "Messages", icon: HelpCircle },
  { id: "profile", label: "Profile", icon: User },
];

export function AccountPanelTabs() {
  const activeSection = useAccountPanelStore((s) => s.activeSection);
  const setSection = useAccountPanelStore((s) => s.setSection);

  return (
    <nav
      aria-label="Account sections"
      className="border-b border-white/8 bg-[#141e36]/80 px-3 py-2 backdrop-blur-md sm:px-4"
    >
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => {
          const isActive = activeSection === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSection(tab.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-300",
                isActive
                  ? "account-panel-tab-active text-white shadow-[0_4px_18px_rgba(255,127,110,0.35)]"
                  : "text-white/55 hover:bg-white/8 hover:text-white/90",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
