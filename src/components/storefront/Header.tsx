"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { LayoutDashboard, Menu, ShoppingBag, User, X } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { getDashboardPath, isAdminRole, SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const baseNavLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?sale=true", label: "Sale" },
  { href: "/shop?clearance=true", label: "Clearance" },
  { href: "/shop?new=true", label: "New Arrivals" },
];

export function Header({ showContact = true }: { showContact?: boolean }) {
  const navLinks = showContact
    ? [...baseNavLinks, { href: "/contact", label: "Contact" }]
    : baseNavLinks;
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());
  const { data: session } = useSession();
  const isAdmin = session?.user?.role ? isAdminRole(session.user.role) : false;
  const accountHref = session?.user?.role
    ? getDashboardPath(session.user.role)
    : "/auth/sign-in";
  const AccountIcon = isAdmin ? LayoutDashboard : User;
  const accountLabel = isAdmin ? "Admin dashboard" : "Account";

  return (
    <header className="border-b border-navy/10 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-xl font-extrabold tracking-tight text-navy sm:text-2xl"
        >
          {SITE_NAME}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-navy/70 transition-colors hover:text-coral"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden rounded-full bg-navy px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-navy/90 sm:inline-flex"
            >
              Admin
            </Link>
          )}
          <Link
            href={accountHref}
            className="flex h-10 w-10 items-center justify-center rounded-full text-navy transition-colors hover:bg-blush/60"
            aria-label={accountLabel}
          >
            <AccountIcon className="h-5 w-5" />
          </Link>
          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-navy transition-colors hover:bg-blush/60"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-navy hover:bg-blush/60 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <nav
        className={cn(
          "border-t border-navy/10 bg-white md:hidden",
          mobileOpen ? "block" : "hidden",
        )}
      >
        <div className="flex flex-col gap-1 px-4 py-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-semibold text-navy/80 hover:bg-blush/40"
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-semibold text-coral hover:bg-blush/40"
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
