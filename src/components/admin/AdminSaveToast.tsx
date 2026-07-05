"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { ADMIN_SAVED_COOKIE } from "@/lib/admin-save-flash.constants";
import { cn } from "@/lib/utils";

function readSavedCookie() {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c === `${ADMIN_SAVED_COOKIE}=1`);
}

function clearSavedCookie() {
  document.cookie = `${ADMIN_SAVED_COOKIE}=; Max-Age=0; path=/`;
}

export function AdminSaveToast() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!readSavedCookie()) return;

    clearSavedCookie();
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 3200);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-6 right-6 z-[100] flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-white px-4 py-3 shadow-lg shadow-emerald-900/10 auth-toast-in",
      )}
      role="status"
      aria-live="polite"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle2 className="h-4 w-4" />
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-900">Changes saved</p>
        <p className="text-xs text-slate-500">Your updates are live.</p>
      </div>
    </div>
  );
}
