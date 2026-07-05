import { getTickerSettings } from "@/lib/ticker";
import { TickerEditor } from "@/components/admin/developer/TickerEditor";

export const dynamic = "force-dynamic";

export default async function DeveloperTickerPage() {
  const ticker = await getTickerSettings();
  return <TickerEditor ticker={ticker} />;
}
