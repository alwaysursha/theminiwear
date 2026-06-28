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
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-coral/20 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-mint/40 blur-2xl" />
      <div className="relative mx-auto flex h-full min-h-0 max-w-7xl items-center overflow-hidden px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="max-w-2xl">
          {hero.eyebrow && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-1.5 text-sm font-semibold text-coral shadow-sm">
              <Sparkles className="h-4 w-4" />
              {hero.eyebrow}
            </span>
          )}
          <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight text-navy sm:text-[2.35rem] lg:text-[3.25rem]">
            {hero.headline}{" "}
            {hero.headlineAccent && (
              <span className="text-coral">{hero.headlineAccent}</span>
            )}
          </h2>
          <p className="mt-3 line-clamp-2 text-base text-navy/70 sm:line-clamp-3 sm:text-lg">{hero.description}</p>
          {hero.buttons.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {hero.buttons.map((btn) => (
                <Link
                  key={btn.id}
                  href={btn.href}
                  className={cn(
                    buttonVariants({
                      variant: btn.variant === "outline" ? "outline" : "default",
                      size: "lg",
                    }),
                  )}
                >
                  {btn.label}
                  {btn.variant === "default" && (
                    <ArrowRight className="h-4 w-4" />
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
