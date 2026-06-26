import { SignUpForm } from "@/components/storefront/SignUpForm";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="rounded-2xl border border-navy/10 bg-white p-8 shadow-sm">
        <h1 className="font-display text-2xl font-extrabold text-navy">
          Join The Mini Wear
        </h1>
        <p className="mt-2 text-sm text-navy/60">
          Create an account for faster checkout and order tracking
        </p>
        <div className="mt-6">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
