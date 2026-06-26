import { CartContent } from "@/components/storefront/CartContent";

export const dynamic = "force-dynamic";

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-extrabold text-navy">Your Cart</h1>
      <p className="mt-1 text-navy/60">Review your items before checkout</p>
      <div className="mt-8">
        <CartContent />
      </div>
    </div>
  );
}
