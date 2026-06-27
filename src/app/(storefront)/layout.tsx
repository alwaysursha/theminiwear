import { AnnouncementTicker } from "@/components/storefront/AnnouncementTicker";
import { Footer } from "@/components/storefront/Footer";
import { Header } from "@/components/storefront/Header";
import { Providers } from "@/components/storefront/Providers";
import { getContactNavPage, getFooterLegalPages } from "@/lib/cms";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let showContact = true;
  let legalLinks: { href: string; label: string }[] = [];

  try {
    const [contactPage, footerLegal] = await Promise.all([
      getContactNavPage(),
      getFooterLegalPages(),
    ]);
    showContact = contactPage !== null;
    legalLinks = footerLegal;
  } catch {
    // defaults above
  }

  return (
    <Providers>
      <div className="sticky top-0 z-50">
        <AnnouncementTicker />
        <Header showContact={showContact} />
      </div>
      <main className="flex-1">{children}</main>
      <Footer legalLinks={legalLinks} />
    </Providers>
  );
}
