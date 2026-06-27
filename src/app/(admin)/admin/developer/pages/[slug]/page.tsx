import { notFound } from "next/navigation";
import { getSitePage } from "@/lib/cms";
import type { SitePageSlug } from "@/lib/cms/types";
import { PageEditorForm } from "@/components/admin/developer/PageEditorForm";

const validSlugs: SitePageSlug[] = ["privacy", "terms", "returns", "contact"];

export const dynamic = "force-dynamic";

export default async function DeveloperPageEditor({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!validSlugs.includes(slug as SitePageSlug)) notFound();

  const page = await getSitePage(slug as SitePageSlug);
  return <PageEditorForm page={page} />;
}
