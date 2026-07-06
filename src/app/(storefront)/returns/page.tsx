import type { Metadata } from "next";
import { SitePageView } from "@/components/storefront/SitePageView";
import { buildSitePageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildSitePageMetadata("returns");
}

export default function ReturnsPage() {
  return <SitePageView slug="returns" />;
}
