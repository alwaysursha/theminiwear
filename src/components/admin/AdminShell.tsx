"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Role } from "@prisma/client";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { PageTransition } from "@/components/PageTransition";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  role: Role;
  userName?: string | null;
  userEmail?: string;
  userRole?: string;
  signOutAction: () => Promise<void>;
  children: ReactNode;
};

export function AdminShell({
  role,
  userName,
  userEmail,
  userRole,
  signOutAction,
  children,
}: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <div className="sticky top-0 hidden h-screen shrink-0 lg:block">
        <AdminSidebar role={role} userName={userName} />
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileOpen ? "" : "pointer-events-none",
        )}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-[17rem] max-w-[85vw] shadow-2xl transition-transform duration-300 ease-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <AdminSidebar
            role={role}
            userName={userName}
            onClose={() => setMobileOpen(false)}
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          userName={userName}
          userEmail={userEmail}
          userRole={userRole}
          signOutAction={signOutAction}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
