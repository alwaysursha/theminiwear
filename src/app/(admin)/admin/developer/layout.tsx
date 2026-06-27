import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { ensureCmsDefaults } from "@/lib/cms";
import { DeveloperNav } from "@/components/admin/developer/DeveloperNav";

export default async function DeveloperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  if (session.user.role !== Role.ADMIN) {
    redirect("/admin");
  }

  try {
    await ensureCmsDefaults();
  } catch {
    // DB unavailable — pages still render with defaults in getters
  }

  return (
    <div className="space-y-2">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Developer</h2>
        <p className="text-sm text-slate-500">
          Edit homepage, categories, and storefront pages without code.
        </p>
      </div>
      <DeveloperNav />
      {children}
    </div>
  );
}
