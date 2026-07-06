import type { Metadata } from "next";
import { getSitePage } from "@/lib/cms";
import type { SitePageSlug } from "@/lib/cms/types";
import { defaultStoreInfo, getStoreInfo } from "@/lib/settings";

export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXTAUTH_URL ??
    "https://theminiwear.com"
  ).replace(/\/$/, "");
}

export function toAbsoluteUrl(path: string, siteUrl = getSiteUrl()) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function getSeoStoreInfo() {
  try {
    return await getStoreInfo();
  } catch {
    return defaultStoreInfo();
  }
}

export function truncateForMeta(text: string, max = 160) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trimEnd()}…`;
}

export function noIndexMetadata(title: string, description?: string): Metadata {
  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
  };
}

type BuildPageMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  /** When true, omit OG/Twitter images so a sibling opengraph-image.tsx route is used. */
  omitOgImage?: boolean;
  noIndex?: boolean;
  ogType?: "website" | "article";
};

export async function buildPageMetadata({
  title,
  description,
  path,
  image,
  omitOgImage = false,
  noIndex = false,
  ogType = "website",
}: BuildPageMetadataInput): Promise<Metadata> {
  const store = await getSeoStoreInfo();
  const canonical = toAbsoluteUrl(path);
  const ogImage = image
    ? toAbsoluteUrl(image)
    : omitOgImage
      ? undefined
      : toAbsoluteUrl("/opengraph-image");

  return {
    title,
    description,
    alternates: { canonical },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: ogType,
      siteName: store.name,
      title,
      description,
      url: canonical,
      ...(ogImage
        ? {
            images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export function buildShopPath(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return query ? `/shop?${query}` : "/shop";
}

const SITE_PAGE_PATHS: Record<SitePageSlug, string> = {
  privacy: "/privacy",
  terms: "/terms",
  returns: "/returns",
  contact: "/contact",
};

export async function buildSitePageMetadata(slug: SitePageSlug) {
  const page = await getSitePage(slug);
  return buildPageMetadata({
    title: page.title,
    description: truncateForMeta(page.subtitle || page.title),
    path: SITE_PAGE_PATHS[slug],
    noIndex: !page.published,
  });
}
