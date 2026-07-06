import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/account/",
        "/auth/",
        "/cart",
        "/checkout/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
