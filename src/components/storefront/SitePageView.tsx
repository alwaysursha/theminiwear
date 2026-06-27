import { notFound } from "next/navigation";
import { getSitePage } from "@/lib/cms";
import type { SitePageSlug } from "@/lib/cms/types";
import { WorkInProgress } from "@/components/storefront/WorkInProgress";

export const dynamic = "force-dynamic";

export async function SitePageView({ slug }: { slug: SitePageSlug }) {
  const page = await getSitePage(slug);

  if (!page.published) {
    return <WorkInProgress title={page.title} />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-extrabold text-navy sm:text-4xl">
        {page.title}
      </h1>
      {page.subtitle && <p className="mt-2 text-navy/60">{page.subtitle}</p>}
      {page.body && (
        <div
          className="prose prose-navy mt-8 max-w-none text-navy/80 prose-headings:font-display prose-a:text-coral"
          dangerouslySetInnerHTML={{ __html: page.body }}
        />
      )}
    </div>
  );
}

export function assertSitePageSlug(slug: string): SitePageSlug {
  if (slug === "privacy" || slug === "terms" || slug === "returns" || slug === "contact") {
    return slug;
  }
  notFound();
}
