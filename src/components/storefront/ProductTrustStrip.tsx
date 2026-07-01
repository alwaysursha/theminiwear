import { ShieldCheck, Sparkles, Truck } from "lucide-react";

const perks = [
  {
    icon: Truck,
    label: "Free shipping $100+",
    tone: "text-coral",
    bg: "bg-coral/10",
  },
  {
    icon: ShieldCheck,
    label: "Easy returns",
    tone: "text-navy",
    bg: "bg-sky/40",
  },
  {
    icon: Sparkles,
    label: "Soft, kid-safe fabrics",
    tone: "text-navy",
    bg: "bg-mint/40",
  },
] as const;

export function ProductTrustStrip() {
  return (
    <ul className="product-detail-enter-5 grid gap-2 sm:grid-cols-3 sm:gap-3">
      {perks.map(({ icon: Icon, label, tone, bg }) => (
        <li
          key={label}
          className="flex items-center gap-2.5 rounded-xl border border-white/70 bg-white/60 px-3 py-2.5 shadow-sm backdrop-blur-sm sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-3"
        >
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9 sm:rounded-xl ${bg}`}
          >
            <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${tone}`} aria-hidden />
          </span>
          <span className="text-[11px] font-semibold leading-snug text-navy/75 sm:text-xs md:text-sm">
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}
