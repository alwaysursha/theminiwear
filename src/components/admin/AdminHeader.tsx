"use client";

import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const titleMap: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/products": "Products",
  "/admin/products/new": "New Product",
  "/admin/orders": "Orders",
  "/admin/inquiries": "Inquiries",
  "/admin/customers": "Customers",
  "/admin/shipping": "Shipping",
  "/admin/discounts": "Discounts",
  "/admin/analytics": "Analytics",
  "/admin/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  if (titleMap[pathname]) return titleMap[pathname];
  if (pathname.match(/\/admin\/products\/[^/]+\/edit/)) return "Edit Product";
  if (pathname.match(/\/admin\/orders\/[^/]+/)) return "Order Detail";
  if (pathname.match(/\/admin\/inquiries\/[^/]+/)) return "Inquiry Thread";
  if (pathname.match(/\/admin\/customers\/[^/]+/)) return "Customer Profile";
  return "Admin";
}

interface AdminHeaderProps {
  userName?: string | null;
  userEmail?: string;
  userRole?: string;
  signOutAction: () => Promise<void>;
}

export function AdminHeader({
  userName,
  userEmail,
  userRole,
  signOutAction,
}: AdminHeaderProps) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">
            {userName ?? "Admin User"}
          </p>
          <p className="text-xs text-slate-500">
            {userEmail}
            {userRole && (
              <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">
                {userRole.replace("_", " ")}
              </span>
            )}
          </p>
        </div>
        <form action={signOutAction}>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="rounded-md border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}
