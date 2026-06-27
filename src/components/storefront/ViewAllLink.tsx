import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewAllLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  tone?: "muted" | "coral" | "mint";
  size?: "xs" | "sm";
};

const toneStyles = {
  muted: {
    link: "text-navy/55 hover:text-coral",
    baseline: "bg-navy/10",
  },
  coral: {
    link: "text-coral",
    baseline: "bg-coral/20",
  },
  mint: {
    link: "text-mint hover:text-white",
    baseline: "bg-white/20",
  },
} as const;

export function ViewAllLink({
  href,
  children,
  className,
  tone = "coral",
  size = "sm",
}: ViewAllLinkProps) {
  const styles = toneStyles[tone];

  return (
    <Link
      href={href}
      className={cn(
        "group/viewall inline-flex shrink-0 items-center gap-1.5 font-semibold transition-colors duration-300",
        size === "xs" && "text-[10px] uppercase tracking-[0.16em]",
        size === "sm" && "text-sm",
        styles.link,
        className,
      )}
    >
      <span className="relative inline-block pb-1.5">
        {children}
        <span
          className={cn(
            "pointer-events-none absolute bottom-0 left-0 h-px w-full",
            styles.baseline,
          )}
          aria-hidden
        />
        <span
          className="pointer-events-none absolute -bottom-px left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-coral to-mint transition-transform duration-[680ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/viewall:scale-x-100"
          aria-hidden
        />
      </span>
      <ArrowRight
        className="h-3 w-3 opacity-40 transition-all duration-300 group-hover/viewall:translate-x-0.5 group-hover/viewall:opacity-100"
        aria-hidden
      />
    </Link>
  );
}
