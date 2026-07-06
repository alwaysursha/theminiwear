"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

const DISMISS_KEY = "mw-open-inquiry-banner-dismissed";

export function OpenInquiryBanner({ count }: { count: number }) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  if (count < 1 || dismissed) {
    return null;
  }

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  return (
    <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-coral/20 bg-coral/5 p-4">
      <p className="text-sm text-navy/80">
        You have {count} open message{count !== 1 ? "s" : ""} waiting for a reply.{" "}
        <Link href="/account/inquiries" className="font-semibold text-coral hover:underline">
          View messages
        </Link>
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-navy/50 transition-colors hover:bg-white/80 hover:text-navy"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
