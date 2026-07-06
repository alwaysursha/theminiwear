import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatMoney } from "@/lib/currency";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | string, currency?: string) {
  return formatMoney(amount, currency);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** App-served uploads must bypass next/image optimization. */
export function shouldBypassImageOptimization(src: string): boolean {
  return src.startsWith("/api/media/") || src.startsWith("/cms-uploads");
}

export function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TMW-${timestamp}-${random}`;
}
