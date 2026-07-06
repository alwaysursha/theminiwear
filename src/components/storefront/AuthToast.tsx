"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useSession } from "next-auth/react";
import { Check, LogOut, UserRound, X } from "lucide-react";
import { useAuthToastStore, firstNameOf, AUTH_WELCOME_KEY, consumePendingSignedOutToast } from "@/lib/auth-toast-store";
import { useAccountPanelStore } from "@/lib/account-panel-store";
import { cn } from "@/lib/utils";

type FlyTarget = { dx: number; dy: number };

const FLY_MS = 620;
const HOLD_MS = 2400;
const EXIT_MS = 320;

export function AuthToast() {
  const { data: session, status } = useSession();
  const toast = useAuthToastStore((s) => s.toast);
  const dismiss = useAuthToastStore((s) => s.dismissAuthToast);
  const showAuthToast = useAuthToastStore((s) => s.showAuthToast);
  const setAccountPulse = useAuthToastStore((s) => s.setAccountPulse);
  const showPostLoginHint = useAccountPanelStore((s) => s.showPostLoginHint);

  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [flyTarget, setFlyTarget] = useState<FlyTarget | null>(null);
  const [flying, setFlying] = useState(false);
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Pick up a pending welcome flagged before a full-page auth redirect (Google).
  useEffect(() => {
    if (typeof window === "undefined" || status === "loading") return;
    const pending = window.sessionStorage.getItem(AUTH_WELCOME_KEY);
    if (!pending) return;
    window.sessionStorage.removeItem(AUTH_WELCOME_KEY);
    showAuthToast({
      kind: "signed-in",
      firstName: firstNameOf(session?.user?.name),
    });
  }, [status, session, showAuthToast]);

  // Pick up a pending sign-out toast after a full-page redirect from profile.
  useEffect(() => {
    if (typeof window === "undefined" || status === "loading") return;
    const pending = consumePendingSignedOutToast();
    if (!pending) return;
    showAuthToast({
      kind: "signed-out",
      firstName: pending.firstName,
    });
  }, [status, showAuthToast]);

  useEffect(() => {
    if (!toast) {
      setOrigin(null);
      setFlyTarget(null);
      setFlying(false);
      setVisible(false);
      setLeaving(false);
      return;
    }

    const timers: number[] = [];
    const isWelcome = toast.kind === "signed-in" || toast.kind === "signed-up";
    const anchor = document.getElementById("site-account-anchor");
    const canFly =
      isWelcome && anchor != null && toast.fromX != null && toast.fromY != null;

    let showDelay = 0;

    if (canFly && anchor && toast.fromX != null && toast.fromY != null) {
      const rect = anchor.getBoundingClientRect();
      const toX = rect.left + rect.width / 2;
      const toY = rect.top + rect.height / 2;
      setOrigin({ x: toast.fromX, y: toast.fromY });
      setFlyTarget({ dx: toX - toast.fromX, dy: toY - toast.fromY });
      setFlying(true);
      showDelay = FLY_MS;

      timers.push(
        window.setTimeout(() => {
          setFlying(false);
          setVisible(true);
          setAccountPulse(true);
          showPostLoginHint();
          timers.push(window.setTimeout(() => setAccountPulse(false), 1200));
        }, FLY_MS),
      );
    } else {
      setVisible(true);
      if (isWelcome) {
        showPostLoginHint();
      }
    }

    timers.push(window.setTimeout(() => setLeaving(true), showDelay + HOLD_MS));
    timers.push(
      window.setTimeout(() => dismiss(), showDelay + HOLD_MS + EXIT_MS),
    );

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [toast, dismiss, setAccountPulse, showPostLoginHint]);

  if (!toast) return null;

  const isWelcome = toast.kind === "signed-in" || toast.kind === "signed-up";
  const name = toast.firstName;

  let title: string;
  let subtitle: string;
  switch (toast.kind) {
    case "signed-in":
      title = name ? `Welcome back, ${name}!` : "Welcome back!";
      subtitle = "You're signed in.";
      break;
    case "signed-up":
      title = name ? `Welcome, ${name}!` : "Welcome!";
      subtitle = "Your account is ready.";
      break;
    case "signed-out":
      title = "Signed out";
      subtitle = name ? `See you soon, ${name}!` : "See you soon!";
      break;
    default: {
      const _exhaustive: never = toast.kind;
      return _exhaustive;
    }
  }

  return (
    <>
      {flying && flyTarget && origin && (
        <div
          className="auth-fly-item pointer-events-none fixed z-[125]"
          style={
            {
              left: origin.x,
              top: origin.y,
              "--fly-dx": `${flyTarget.dx}px`,
              "--fly-dy": `${flyTarget.dy}px`,
            } as CSSProperties
          }
          aria-hidden
        >
          <span className="absolute inset-0 rounded-full bg-coral/40 blur-md" />
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-white bg-gradient-to-br from-coral to-[#ff9d70] text-white shadow-[0_12px_30px_rgba(255,127,110,0.5)]">
            <UserRound className="h-6 w-6" strokeWidth={2.5} />
          </span>
        </div>
      )}

      {visible && (
        <div
          className={cn(
            "fixed right-3 top-3 z-[120] sm:right-5 sm:top-5",
            leaving ? "auth-toast-out" : "auth-toast-in",
          )}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/95 py-3 pl-3 pr-4 shadow-[0_18px_48px_rgba(30,42,74,0.22)] backdrop-blur-md">
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                isWelcome
                  ? "bg-gradient-to-br from-mint to-sky text-navy"
                  : "bg-navy/[0.06] text-navy/70",
              )}
              aria-hidden
            >
              {isWelcome ? (
                <Check className="h-5 w-5" strokeWidth={3} />
              ) : (
                <LogOut className="h-5 w-5" strokeWidth={2.5} />
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-extrabold text-navy">
                {title}
              </p>
              <p className="truncate text-xs text-navy/60">{subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setLeaving(true);
                window.setTimeout(() => dismiss(), EXIT_MS);
              }}
              className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-navy/40 transition-colors hover:bg-blush/60 hover:text-navy"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
