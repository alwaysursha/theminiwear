import { AnnouncementTicker } from "@/components/storefront/AnnouncementTicker";
import { SiteWideSaleBanner } from "@/components/storefront/SiteWideSaleBanner";
import { Footer } from "@/components/storefront/Footer";
import { Header } from "@/components/storefront/Header";
import { StorefrontHeaderChrome } from "@/components/storefront/StorefrontHeaderChrome";
import { Providers } from "@/components/storefront/Providers";
import { WhatsAppChatButton } from "@/components/storefront/WhatsAppChatButton";
import { PageTransition } from "@/components/PageTransition";
import { getContactNavPage, getFooterLegalPages } from "@/lib/cms";
import { defaultStoreInfo, getSiteSaleSettings, getStoreInfo } from "@/lib/settings";
import { getFreeShippingThreshold } from "@/lib/shipping";
import { buildTickerAnnouncement, getTickerSettings } from "@/lib/ticker";
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
  let tickerAnnouncement =
    "Orders processed and shipped within 2-5 business days";
  let siteSale = { enabled: false, percent: 0 };

  try {
    const [storeInfo, threshold, tickerSettings, saleSettings] =
      await Promise.all([
        getStoreInfo(),
        getFreeShippingThreshold(),
        getTickerSettings(),
        getSiteSaleSettings(),
      ]);
    store = storeInfo;
    freeShippingThreshold = threshold;
    siteSale = saleSettings;
    const freeShippingMessage =
      freeShippingThreshold != null
        ? `Free shipping on orders over ${formatPrice(freeShippingThreshold, store.currency)}`
        : null;
    tickerAnnouncement = buildTickerAnnouncement(
      tickerSettings,
      freeShippingMessage,
    );
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
    <Providers currency={store.currency}>
      <StorefrontHeaderChrome>
        <AnnouncementTicker announcement={tickerAnnouncement} />
        {siteSale.enabled && siteSale.percent > 0 && (
          <SiteWideSaleBanner percent={siteSale.percent} />
        )}
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
