"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  MessageSquare,
  Package,
  Percent,
  Settings,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";

import type { Role } from "@prisma/client";
import { canAccessAdminSection } from "@/lib/admin-permissions";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true, section: "dashboard" as const },
  { href: "/admin/products", label: "Products", icon: Package, section: "products" as const },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart, section: "orders" as const },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare, section: "inquiries" as const },
  { href: "/admin/customers", label: "Customers", icon: Users, section: "customers" as const },
  { href: "/admin/shipping", label: "Shipping", icon: Truck, section: "shipping" as const },
  { href: "/admin/discounts", label: "Discounts", icon: Percent, section: "discounts" as const },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, section: "analytics" as const },
  { href: "/admin/settings", label: "Settings", icon: Settings, section: "settings" as const },
];

export function AdminSidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const visibleItems = navItems.filter((item) =>
    canAccessAdminSection(role, item.section),
  );

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-slate-900 text-white">
      <div className="border-b border-slate-700 px-6 py-5">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Admin
        </p>
        <p className="mt-1 text-lg font-semibold text-white">{SITE_NAME}</p>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-700 px-6 py-4">
        <Link
          href="/"
          className="text-sm text-slate-400 transition-colors hover:text-white"
        >
          ← Back to storefront
        </Link>
      </div>
    </aside>
  );
}
