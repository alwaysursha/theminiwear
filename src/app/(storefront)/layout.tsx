import { AnnouncementTicker } from "@/components/storefront/AnnouncementTicker";
import { Footer } from "@/components/storefront/Footer";
import { Header } from "@/components/storefront/Header";
import { StorefrontHeaderChrome } from "@/components/storefront/StorefrontHeaderChrome";
import { Providers } from "@/components/storefront/Providers";
import { WhatsAppChatButton } from "@/components/storefront/WhatsAppChatButton";
import { PageTransition } from "@/components/PageTransition";
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
      <StorefrontHeaderChrome>
        <AnnouncementTicker />
        <Header showContact={showContact} />
      </StorefrontHeaderChrome>
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer legalLinks={legalLinks} />
      <WhatsAppChatButton />
    </Providers>
  );
}
