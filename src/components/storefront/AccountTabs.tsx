"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  HelpCircle,
  MapPin,
  Package,
  User,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AccountTab = {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
};

const tabs: AccountTab[] = [
  {
    href: "/account/orders",
    label: "Orders",
    icon: Package,
    isActive: (pathname) =>
      pathname === "/account/orders" || pathname.startsWith("/account/orders/"),
  },
  {
    href: "/account/wishlist",
    label: "Wishlist",
    icon: Heart,
    isActive: (pathname) => pathname.startsWith("/account/wishlist"),
  },
  {
    href: "/account/addresses",
    label: "Addresses",
    icon: MapPin,
    isActive: (pathname) => pathname.startsWith("/account/addresses"),
  },
  {
    href: "/account/inquiries",
    label: "Messages",
    icon: HelpCircle,
    isActive: (pathname) => pathname.startsWith("/account/inquiries"),
  },
  {
    href: "/account/profile",
    label: "Profile",
    icon: User,
    isActive: (pathname) => pathname.startsWith("/account/profile"),
  },
];

export function AccountTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Account sections"
      className="sticky top-16 z-30 -mx-4 border-b border-navy/10 bg-background/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:top-24 lg:-mx-8 lg:px-8"
    >
      <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => {
          const isActive = tab.isActive(pathname);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-coral/10 text-coral"
                  : "text-navy/70 hover:bg-blush/40 hover:text-navy",
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
