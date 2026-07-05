import { AnnouncementTicker } from "@/components/storefront/AnnouncementTicker";
import { Footer } from "@/components/storefront/Footer";
import { Header } from "@/components/storefront/Header";
import { StorefrontHeaderChrome } from "@/components/storefront/StorefrontHeaderChrome";
import { Providers } from "@/components/storefront/Providers";
import { WhatsAppChatButton } from "@/components/storefront/WhatsAppChatButton";
import { PageTransition } from "@/components/PageTransition";
import { getContactNavPage, getFooterLegalPages } from "@/lib/cms";
import { defaultStoreInfo, getStoreInfo } from "@/lib/settings";
import { getFreeShippingThreshold } from "@/lib/shipping";
import { formatPrice } from "@/lib/utils";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let showContact = true;
  let legalLinks: { href: string; label: string }[] = [];

  let store = defaultStoreInfo();
  let freeShippingThreshold: number | null = null;
  try {
    store = await getStoreInfo();
    freeShippingThreshold = await getFreeShippingThreshold();
  } catch {
    // DB unavailable — fall back to static store defaults
  }

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
        <AnnouncementTicker
          freeShippingMessage={
            freeShippingThreshold != null
              ? `Free shipping on orders over ${formatPrice(freeShippingThreshold)}`
              : null
          }
        />
        <Header showContact={showContact} />
      </StorefrontHeaderChrome>
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer legalLinks={legalLinks} storeName={store.name} />
      <WhatsAppChatButton
        phoneE164={store.whatsappE164}
        intro={store.whatsappIntro}
      />
    </Providers>
  );
}
