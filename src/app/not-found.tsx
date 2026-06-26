import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-extrabold text-coral">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-navy">
        Page not found
      </h1>
      <p className="mt-2 max-w-md text-navy/60">
        We could not find that page. Maybe it was outgrown like last season&apos;s
        onesie?
      </p>
      <Link href="/" className="mt-8">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
