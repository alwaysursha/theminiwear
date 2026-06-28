import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { HeroSettingsData } from "@/lib/cms/types";
import { HERO_GRADIENT_PRESETS } from "@/lib/cms/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HeroBrandSlide({ hero }: { hero: HeroSettingsData }) {
  const gradientClass =
    HERO_GRADIENT_PRESETS[hero.gradientPreset] ??
    HERO_GRADIENT_PRESETS["blush-sky-mint"];

  return (
    <div
      className={cn(
        "relative h-full min-h-0 overflow-hidden",
        hero.backgroundType === "gradient" ? gradientClass : "bg-slate-200",
      )}
      style={
        hero.backgroundType === "image" && hero.backgroundImageUrl
          ? {
              backgroundImage: `url(${hero.backgroundImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-coral/20 blur-3xl sm:-right-20 sm:-top-20 sm:h-64 sm:w-64" />
      <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-mint/40 blur-2xl sm:-bottom-10 sm:-left-10 sm:h-48 sm:w-48" />

      <div className="relative mx-auto flex h-full min-h-0 max-w-7xl items-center overflow-hidden px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="w-full max-w-2xl">
          {hero.eyebrow && (
            <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-coral shadow-sm sm:px-4 sm:py-1.5 sm:text-sm">
              <Sparkles className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              <span className="truncate">{hero.eyebrow}</span>
            </span>
          )}

          <h2 className="mt-3 font-display text-[1.65rem] font-extrabold leading-[1.12] text-navy sm:mt-4 sm:text-[2.35rem] sm:leading-tight lg:text-[3.25rem]">
            {hero.headline}
            {hero.headlineAccent && (
              <>
                {" "}
                <span className="block text-coral sm:inline">{hero.headlineAccent}</span>
              </>
            )}
          </h2>

          <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-navy/70 sm:mt-3 sm:text-lg">
            {hero.description}
          </p>

          {hero.buttons.length > 0 && (
            <div className="mt-5 grid w-full grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 sm:mt-6 sm:flex sm:w-auto sm:flex-wrap sm:gap-3">
              {hero.buttons.map((btn, index) => (
                <Link
                  key={btn.id}
                  href={btn.href}
                  className={cn(
                    buttonVariants({
                      variant: btn.variant === "outline" ? "outline" : "default",
                      size: "default",
                    }),
                    "h-10 w-full px-5 text-sm sm:h-12 sm:w-auto sm:px-8 sm:text-base",
                    index === 0 && "min-[420px]:col-span-2 sm:col-span-1",
                  )}
                >
                  {btn.label}
                  {btn.variant === "default" && (
                    <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
