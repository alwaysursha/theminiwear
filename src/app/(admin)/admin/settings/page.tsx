import { Store } from "lucide-react";
import { getStoreInfo } from "@/lib/settings";
import { StoreInfoForm } from "@/components/admin/settings/StoreInfoForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const store = await getStoreInfo();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Settings
        </h2>
        <p className="text-sm text-slate-500">Store configuration</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-start gap-3 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 sm:p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Store information</h3>
            <p className="mt-0.5 text-sm text-slate-500">
              These details power your site metadata (title, description),
              footer, and WhatsApp chat button.
            </p>
          </div>
        </div>
        <StoreInfoForm store={store} />
      </div>
    </div>
  );
}
