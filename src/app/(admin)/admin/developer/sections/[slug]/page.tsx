import { notFound } from "next/navigation";
import { HomepageSectionKey } from "@prisma/client";
import { countSectionProducts, getHomepageSection } from "@/lib/cms";
import { SectionEditorForm } from "@/components/admin/developer/SectionEditorForm";

const slugToKey: Record<string, HomepageSectionKey> = {
  categories: "CATEGORIES",
  "new-arrivals": "NEW_ARRIVALS",
  "on-sale": "ON_SALE",
  clearance: "CLEARANCE",
  trending: "TRENDING",
};

export const dynamic = "force-dynamic";

export default async function DeveloperSectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const key = slugToKey[slug];
  if (!key) notFound();

  const section = await getHomepageSection(key);
  const productCount =
    key === "CATEGORIES"
      ? undefined
      : await countSectionProducts(key, section.includeSiteWideSale);

  return <SectionEditorForm section={section} productCount={productCount} />;
}
