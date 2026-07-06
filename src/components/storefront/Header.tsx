"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LayoutDashboard, Menu, ShoppingBag, User, X } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useCartUiStore } from "@/lib/cart-ui-store";
import { useAuthToastStore, firstNameOf } from "@/lib/auth-toast-store";
import { useAccountPanelStore } from "@/lib/account-panel-store";
import {
  AccountLoginHint,
  AccountOpenChevron,
} from "@/components/storefront/AccountLoginHint";
import { SiteLogo } from "@/components/storefront/SiteLogo";
import { getDashboardPath, isAdminRole } from "@/lib/constants";
import { cn } from "@/lib/utils";

const baseNavLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?sale=true", label: "Sale" },
  { href: "/shop?clearance=true", label: "Clearance" },
  { href: "/shop?new=true", label: "New Arrivals" },
];

export function Header({ showContact = true }: { showContact?: boolean }) {
  const pathname = usePathname();
  const navLinks = showContact
    ? [...baseNavLinks, { href: "/contact", label: "Contact" }]
    : baseNavLinks;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartReady, setCartReady] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());
  const cartPulse = useCartUiStore((s) => s.cartPulse);
  const accountPulse = useAuthToastStore((s) => s.accountPulse);
  const showLoginHint = useAccountPanelStore((s) => s.showLoginHint);
  const hintMessageVisible = useAccountPanelStore((s) => s.hintMessageVisible);
  const isPanelOpen = useAccountPanelStore((s) => s.isOpen);
  const openPanel = useAccountPanelStore((s) => s.open);
  const closePanel = useAccountPanelStore((s) => s.close);
  const dismissLoginHint = useAccountPanelStore((s) => s.dismissLoginHint);
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isAdmin =
    isAuthenticated && session?.user?.role
      ? isAdminRole(session.user.role)
      : false;
  const isCustomer = isAuthenticated && !isAdmin;
  const firstName = isAuthenticated ? firstNameOf(session?.user?.name) : null;
  const safeCallbackPath =
    pathname && pathname !== "/" && !pathname.startsWith("/auth/")
      ? pathname
      : null;
  const signInHref = safeCallbackPath
    ? `/auth/sign-in?callbackUrl=${encodeURIComponent(safeCallbackPath)}`
    : "/auth/sign-in";
  const adminHref = getDashboardPath(session?.user?.role ?? "USER");
  const AccountIcon = isAdmin ? LayoutDashboard : User;
  const accountLabel = isAdmin ? "Admin dashboard" : "Account";

  useEffect(() => {
    setCartReady(true);
  }, []);

  const showCartCount = cartReady && itemCount > 0;

  function handleAccountOpen() {
    dismissLoginHint();
    if (isPanelOpen) {
      closePanel();
      return;
    }
    openPanel("orders");
  }

  const accountButtonClass = cn(
    "relative flex h-10 items-center justify-center rounded-full text-navy transition-colors hover:bg-blush/60",
    firstName ? "gap-1.5 pl-3 pr-2" : "w-10",
    accountPulse && "cart-anchor-pulse",
    isPanelOpen && isCustomer && "bg-coral/10 text-coral",
  );

  return (
    <header className="border-b border-navy/10 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/40">
          <SiteLogo variant="header" priority />
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

          {isCustomer ? (
            <button
              type="button"
              id="site-account-anchor"
              onClick={handleAccountOpen}
              className={cn(accountButtonClass, "group/account overflow-visible")}
              aria-label={
                firstName ? `View dashboard — ${firstName}` : "View dashboard"
              }
              aria-expanded={isPanelOpen}
            >
              {firstName && (
                <span className="hidden max-w-[7rem] truncate text-sm font-semibold leading-none sm:inline">
                  Hi, {firstName}
                </span>
              )}
              <AccountOpenChevron
                highlighted={showLoginHint && hintMessageVisible && !isPanelOpen}
                panelOpen={isPanelOpen}
              />
              <AccountIcon className="h-5 w-5 shrink-0" />
              {!isPanelOpen && !hintMessageVisible && (
                <span
                  className="pointer-events-none absolute left-1/2 top-[calc(100%+8px)] z-50 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-full border border-navy/10 bg-navy px-3 py-1.5 text-[11px] font-semibold text-white opacity-0 shadow-[0_10px_24px_rgba(30,42,74,0.22)] transition-all duration-200 group-hover/account:translate-y-0 group-hover/account:opacity-100"
                  role="tooltip"
                >
                  View dashboard
                </span>
              )}
              {accountPulse && (
                <span
                  className="cart-anchor-ring pointer-events-none absolute inset-0 rounded-full"
                  aria-hidden
                />
              )}
              <AccountLoginHint />
            </button>
          ) : (
            <Link
              id="site-account-anchor"
              href={isAdmin ? adminHref : signInHref}
              className={accountButtonClass}
              aria-label={firstName ? `${accountLabel} — ${firstName}` : accountLabel}
            >
              {firstName && (
                <span className="hidden max-w-[7rem] truncate text-sm font-semibold leading-none sm:inline">
                  Hi, {firstName}
                </span>
              )}
              <AccountIcon className="h-5 w-5 shrink-0" />
              {accountPulse && (
                <span
                  className="cart-anchor-ring pointer-events-none absolute inset-0 rounded-full"
                  aria-hidden
                />
              )}
            </Link>
          )}

          <Link
            id="site-cart-anchor"
            href="/cart"
            className={cn(
              "relative flex h-10 w-10 items-center justify-center rounded-full text-navy transition-colors hover:bg-blush/60",
              cartPulse && "cart-anchor-pulse",
            )}
            aria-label={
              showCartCount ? `Bag, ${itemCount} items` : "Bag"
            }
          >
            <ShoppingBag className="h-5 w-5" />
            {showCartCount && (
              <span
                className={cn(
                  "absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white transition-transform",
                  cartPulse && "cart-badge-pop",
                )}
              >
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
            {cartPulse && (
              <span
                className="cart-anchor-ring pointer-events-none absolute inset-0 rounded-full"
                aria-hidden
              />
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
          {isCustomer && (
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                handleAccountOpen();
              }}
              className="rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-coral hover:bg-blush/40"
            >
              My Account
            </button>
          )}
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
