import { getHeroSettings } from "@/lib/cms";
import { HeroEditor } from "@/components/admin/developer/HeroEditor";

export const dynamic = "force-dynamic";

export default async function DeveloperHeroPage() {
  const hero = await getHeroSettings();
  return <HeroEditor hero={hero} />;
}
