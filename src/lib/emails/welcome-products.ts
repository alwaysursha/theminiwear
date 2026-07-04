import { getHomepageSectionProducts } from "@/lib/cms/products";
import {
  getProductPriceRange,
  productImageForColor,
  type ProductWithRelations,
} from "@/lib/product-utils";
import { getSiteSaleSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/utils";
import { getEmailLogoUrl, toAbsoluteUrl } from "@/emails/theme";
import type { EmailProductSection } from "@/emails/components/product-section";

const SECTION_LIMIT = 4;

function toEmailProduct(
  product: ProductWithRelations,
  siteSale: Awaited<ReturnType<typeof getSiteSaleSettings>>,
) {
  const image = productImageForColor(product.images, null);
  const pricing = getProductPriceRange(product.variants, product, siteSale);

  return {
    name: product.name,
    slug: product.slug,
    imageUrl: image ? toAbsoluteUrl(image) : getEmailLogoUrl(),
    price: pricing.display,
    compareAtPrice:
      pricing.hasSale && pricing.compareAtMin != null
        ? formatPrice(pricing.compareAtMin)
        : undefined,
  };
}

export async function getWelcomeEmailProductSections(): Promise<
  EmailProductSection[]
> {
  const siteSale = await getSiteSaleSettings();
  const [newArrivals, trending, onSale] = await Promise.all([
    getHomepageSectionProducts("NEW_ARRIVALS"),
    getHomepageSectionProducts("TRENDING"),
    getHomepageSectionProducts("ON_SALE", { minimum: SECTION_LIMIT }),
  ]);

  return [
    {
      title: "New Arrivals",
      href: "/shop?new=true",
      products: newArrivals.slice(0, SECTION_LIMIT).map((p) => toEmailProduct(p, siteSale)),
    },
    {
      title: "Trending Now",
      href: "/shop?sort=trending",
      products: trending.slice(0, SECTION_LIMIT).map((p) => toEmailProduct(p, siteSale)),
    },
    {
      title: "On Sale",
      href: "/shop?sale=true",
      products: onSale.slice(0, SECTION_LIMIT).map((p) => toEmailProduct(p, siteSale)),
    },
  ];
}
