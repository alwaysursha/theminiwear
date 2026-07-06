"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
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
  "/admin/profile": "My profile",
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
  onMenuClick?: () => void;
}

export function AdminHeader({
  userName,
  userEmail,
  userRole,
  signOutAction,
  onMenuClick,
}: AdminHeaderProps) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8 lg:py-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="-ml-1 rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="truncate text-lg font-semibold text-slate-900 sm:text-xl">
          {title}
        </h1>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <div className="hidden text-right sm:block">
          <Link
            href="/admin/profile"
            className="block rounded-md transition-colors hover:bg-slate-50"
          >
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
          </Link>
        </div>
        <Button
          type="button"
          onClick={() => setConfirmOpen(true)}
          variant="outline"
          size="sm"
          className="rounded-md border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>

      {confirmOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
            <button
              type="button"
              aria-label="Close"
              onClick={() => setConfirmOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <div
              className="dash-rise relative w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5"
              style={{ "--dash-i": 0 } as CSSProperties}
              role="alertdialog"
              aria-modal="true"
            >
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                aria-label="Close"
                className="absolute right-4 top-4 rounded-md p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <LogOut className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Sign out?
              </h3>
              <p className="mt-1.5 text-sm text-slate-500">
                You&apos;ll be signed out of the admin panel and need to log in
                again to continue.
              </p>
              <div className="mt-6 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </header>
  );
}
