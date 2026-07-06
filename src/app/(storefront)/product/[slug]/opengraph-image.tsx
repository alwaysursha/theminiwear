import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import {
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  OgProductTemplate,
} from "@/lib/og/templates";
import { getProductPriceRange } from "@/lib/product-utils";
import { prisma } from "@/lib/prisma";
import { getSiteSaleSettings } from "@/lib/settings";
import { getSeoStoreInfo } from "@/lib/seo";

export const alt = "Product preview";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export default async function Image({ params }: RouteProps) {
  const { slug } = await params;

  const [product, siteSale, store] = await Promise.all([
    prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        variants: true,
        category: true,
      },
    }),
    getSiteSaleSettings(),
    getSeoStoreInfo(),
  ]);

  if (!product) {
    notFound();
  }

  const pricing = getProductPriceRange(product.variants, product, siteSale);
  const imageSrc = product.ogImageUrl ?? product.images[0]?.url ?? null;

  return new ImageResponse(
    <OgProductTemplate
      storeName={store.name}
      productName={product.metaTitle || product.name}
      priceLabel={pricing.display}
      categoryName={product.category?.name}
      imageSrc={imageSrc}
    />,
    {
      ...OG_IMAGE_SIZE,
    },
  );
}
