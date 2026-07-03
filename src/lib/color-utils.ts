/** Maps a human color name to a CSS background for swatch dots. */

type Swatch = {
  /** CSS background value (solid color or gradient). */
  css: string;
  /** Light colors need a visible border ring so they read on white. */
  light: boolean;
};

const RAINBOW =
  "conic-gradient(from 210deg, #ff7f6e, #fde68a, #86efac, #7ecfc0, #93c5fd, #c4b5fd, #f9a8d4, #ff7f6e)";

const COLOR_MAP: Record<string, Swatch> = {
  white: { css: "#ffffff", light: true },
  cream: { css: "#f5ecd7", light: true },
  ivory: { css: "#fffff0", light: true },
  beige: { css: "#e7d8c1", light: true },
  pink: { css: "#f9a8d4", light: false },
  blush: { css: "#fde8e8", light: true },
  rose: { css: "#fb7185", light: false },
  red: { css: "#ef4444", light: false },
  coral: { css: "#ff7f6e", light: false },
  orange: { css: "#fdba74", light: false },
  yellow: { css: "#fde047", light: true },
  gold: { css: "#e0b64d", light: false },
  green: { css: "#86efac", light: false },
  mint: { css: "#c8f0e0", light: true },
  teal: { css: "#5eead4", light: false },
  blue: { css: "#93c5fd", light: false },
  sky: { css: "#bae6fd", light: true },
  navy: { css: "#1e2a4a", light: false },
  purple: { css: "#c4b5fd", light: false },
  lavender: { css: "#ddd6fe", light: true },
  gray: { css: "#9ca3af", light: false },
  grey: { css: "#9ca3af", light: false },
  silver: { css: "#d1d5db", light: true },
  brown: { css: "#b08968", light: false },
  tan: { css: "#d2b48c", light: false },
  black: { css: "#1f2937", light: false },
  charcoal: { css: "#374151", light: false },
  multi: { css: RAINBOW, light: false },
  rainbow: { css: RAINBOW, light: false },
};

export function getColorSwatch(name: string): Swatch {
  const key = name.trim().toLowerCase();
  if (COLOR_MAP[key]) return COLOR_MAP[key];

  // Try to match a known color word contained in a compound name (e.g. "Sky Blue").
  for (const word of Object.keys(COLOR_MAP)) {
    if (key.includes(word)) return COLOR_MAP[word];
  }

  return { css: "#cbd5e1", light: true };
}

/** Unique, order-preserving list of variant color names. */
export function uniqueColors(variants: { color: string }[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of variants) {
    const c = v.color?.trim();
    if (!c) continue;
    const key = c.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}
