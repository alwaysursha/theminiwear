import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ session_id?: string }>;

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-mint/50">
        <CheckCircle className="h-10 w-10 text-navy" />
      </div>
      <h1 className="mt-6 font-display text-3xl font-extrabold text-navy">
        Thank you for your order!
      </h1>
      <p className="mt-3 text-navy/70">
        Your payment was successful. We&apos;ll send you a confirmation email
        shortly with your order details.
      </p>
      {params.session_id && (
        <p className="mt-2 text-xs text-navy/40">
          Reference: {params.session_id.slice(0, 20)}...
        </p>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/account/orders" className={cn(buttonVariants())}>
          View Orders
        </Link>
        <Link
          href="/shop"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
