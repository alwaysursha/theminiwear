import { AccountPanelHost } from "@/components/storefront/AccountPanelHost";
import { MemberOrderBanner } from "@/components/storefront/MemberOrderBanner";
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
import { getTickerSettings } from "@/lib/ticker";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let showContact = true;
  let legalLinks: { href: string; label: string }[] = [];

  let store = defaultStoreInfo();
  let tickerMessages: string[] = [];
  let siteSale = { enabled: false, percent: 0 };

  try {
    const [storeInfo, tickerSettings, saleSettings] = await Promise.all([
      getStoreInfo(),
      getTickerSettings(),
      getSiteSaleSettings(),
    ]);
    store = storeInfo;
    siteSale = saleSettings;
    tickerMessages = tickerSettings.messages;
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
        {tickerMessages.length > 0 ? (
          <AnnouncementTicker messages={tickerMessages} />
        ) : null}
        {siteSale.enabled && siteSale.percent > 0 && (
          <SiteWideSaleBanner percent={siteSale.percent} />
        )}
        <Header showContact={showContact} />
      </StorefrontHeaderChrome>
      <AccountPanelHost>
        <MemberOrderBanner />
        <main className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer
          legalLinks={legalLinks}
          storeName={store.name}
          storeDescription={store.description}
        />
      </AccountPanelHost>
      <WhatsAppChatButton
        phoneE164={store.whatsappE164}
        intro={store.whatsappIntro}
      />
    </Providers>
  );
}
