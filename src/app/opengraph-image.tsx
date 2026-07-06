import { ImageResponse } from "next/og";
import {
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  OgSiteTemplate,
} from "@/lib/og/templates";
import { getSeoStoreInfo } from "@/lib/seo";

export const alt = "The Mini Wear";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default async function Image() {
  const store = await getSeoStoreInfo();

  return new ImageResponse(
    <OgSiteTemplate storeName={store.name} description={store.description} />,
    {
      ...OG_IMAGE_SIZE,
    },
  );
}
