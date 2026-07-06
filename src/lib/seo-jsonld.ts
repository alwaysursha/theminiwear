import type { Category, Product, ProductImage, ProductVariant } from "@prisma/client";
import { getProductPriceRange } from "@/lib/product-utils";
import type { SiteSaleSettings } from "@/lib/settings";
import { getSiteUrl, toAbsoluteUrl } from "@/lib/seo";

type ProductForJsonLd = Product & {
  images: ProductImage[];
  variants: ProductVariant[];
  category: Category | null;
};

export function buildOrganizationJsonLd(store: {
  name: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: store.name,
    description: store.description,
    url: getSiteUrl(),
    logo: toAbsoluteUrl("/logo.png"),
    email: "hello@theminiwear.com",
  };
}

export function buildWebSiteJsonLd(storeName: string) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: storeName,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/shop?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildBreadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path),
    })),
  };
}

export function buildProductJsonLd(
  product: ProductForJsonLd,
  storeName: string,
  currency: string,
  siteSale?: SiteSaleSettings,
  rating?: { average: number; count: number },
) {
  const pricing = getProductPriceRange(product.variants, product, siteSale);
  const inStock = product.variants.some((variant) => variant.stock > 0);
  const url = toAbsoluteUrl(`/product/${product.slug}`);

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((image) =>
      image.url.startsWith("http") ? image.url : toAbsoluteUrl(image.url),
    ),
    sku: product.variants[0]?.sku,
    brand: { "@type": "Brand", name: storeName },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: currency,
      lowPrice: pricing.minCurrent.toFixed(2),
      highPrice: pricing.maxCurrent.toFixed(2),
      offerCount: product.variants.length,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url,
    },
  };

  if (product.category) {
    data.category = product.category.name;
  }

  if (rating && rating.count > 0) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating.average.toFixed(1),
      reviewCount: rating.count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return data;
}
