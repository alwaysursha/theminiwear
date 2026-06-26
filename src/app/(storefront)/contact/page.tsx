import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/storefront/ContactForm";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl font-extrabold text-navy sm:text-4xl">
          Get in Touch
        </h1>
        <p className="mt-2 text-navy/60">
          Questions about sizing, orders, or our products? We&apos;re here to help!
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="rounded-2xl border border-navy/10 bg-white p-8 shadow-sm">
          <h2 className="font-display text-lg font-bold text-navy">
            Send us a message
          </h2>
          <div className="mt-6">
            <ContactForm
              defaultName={session?.user?.name}
              defaultEmail={session?.user?.email}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-blush to-sky/50 p-6">
            <h3 className="font-display font-bold text-navy">Contact Info</h3>
            <ul className="mt-4 space-y-4 text-sm text-navy/70">
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-coral" />
                hello@theminiwear.com
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-coral" />
                (555) 123-KIDS
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-coral" />
                123 Playful Lane
                <br />
                San Francisco, CA 94102
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-navy/10 bg-white p-6">
            <h3 className="font-display font-bold text-navy">Hours</h3>
            <p className="mt-2 text-sm text-navy/70">
              Mon–Fri: 9am – 5pm PST
              <br />
              Sat–Sun: Closed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
