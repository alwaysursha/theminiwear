import { Footer } from "@/components/storefront/Footer";
import { Header } from "@/components/storefront/Header";
import { Providers } from "@/components/storefront/Providers";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </Providers>
  );
}
