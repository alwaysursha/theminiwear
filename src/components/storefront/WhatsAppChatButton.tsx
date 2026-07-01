"use client";

import { Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { WHATSAPP_URL, buildWhatsAppUrl } from "@/lib/constants";
import { cn } from "@/lib/utils";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function WhatsAppChatButton() {
  const pathname = usePathname();
  const [href, setHref] = useState(WHATSAPP_URL);
  const isProductPage = pathname.startsWith("/product/");

  useEffect(() => {
    setHref(buildWhatsAppUrl(window.location.href));
  }, [pathname]);

  return (
    <div
      className={cn(
        "whatsapp-chat-anchor pointer-events-none fixed right-4 z-[55] sm:right-7",
        isProductPage
          ? "bottom-[calc(5rem+env(safe-area-inset-bottom))] lg:bottom-7"
          : "bottom-5 sm:bottom-7",
      )}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-chat-button group pointer-events-auto relative flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
        aria-label="Chat with us on WhatsApp"
      >
        <span className="whatsapp-chat-badge hidden rounded-full border border-white/80 bg-white/95 px-3.5 py-2 font-display text-sm font-bold text-navy shadow-[0_8px_24px_rgba(30,42,74,0.14)] backdrop-blur-sm transition-[transform,opacity] duration-300 group-hover:-translate-x-0.5 group-hover:shadow-[0_10px_28px_rgba(30,42,74,0.18)] sm:inline-flex sm:items-center sm:gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-coral" aria-hidden />
          Any Questions?
        </span>

        <span className="relative flex h-[3.75rem] w-[3.75rem] items-center justify-center sm:h-16 sm:w-16">
          <span
            className="whatsapp-chat-pulse absolute inset-0 rounded-full bg-[linear-gradient(135deg,#c8f0e0_0%,#f4a4b8_55%,#967BB6_100%)]"
            aria-hidden
          />
          <span
            className="whatsapp-chat-pulse whatsapp-chat-pulse-delay absolute inset-0 rounded-full bg-[linear-gradient(135deg,#25D366_0%,#7ecfc0_100%)]"
            aria-hidden
          />

          <span className="relative flex h-full w-full items-center justify-center rounded-full border-[3px] border-white bg-[linear-gradient(145deg,#e8fff4_0%,#ffffff_42%,#fde8e8_100%)] shadow-[0_10px_30px_rgba(30,42,74,0.22),0_0_0_1px_rgba(255,255,255,0.65)_inset] transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(145deg,#2fe07a_0%,#25D366_55%,#128C7E_100%)] text-white shadow-[0_4px_14px_rgba(37,211,102,0.45)] sm:h-12 sm:w-12">
              <WhatsAppIcon className="h-6 w-6 sm:h-[1.65rem] sm:w-[1.65rem]" />
            </span>

            <Sparkles
              className="absolute -right-0.5 -top-0.5 h-4 w-4 text-coral drop-shadow-sm"
              aria-hidden
            />
            <span
              className="absolute -left-1 bottom-1 h-2 w-2 rounded-full bg-sky shadow-sm"
              aria-hidden
            />
            <span
              className="absolute -bottom-0.5 right-2 h-1.5 w-1.5 rounded-full bg-mint shadow-sm"
              aria-hidden
            />
          </span>
        </span>
      </a>
    </div>
  );
}
