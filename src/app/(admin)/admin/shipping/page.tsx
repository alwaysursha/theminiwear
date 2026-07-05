import { prisma } from "@/lib/prisma";
import { ShippingManager } from "@/components/admin/shipping/ShippingManager";

export const dynamic = "force-dynamic";

export default async function AdminShippingPage() {
  const zones = await prisma.shippingZone.findMany({
    include: { rates: true },
    orderBy: { name: "asc" },
  });

  return (
    <ShippingManager
      zones={zones.map((zone) => ({
        id: zone.id,
        name: zone.name,
        countries: zone.countries,
        isActive: zone.isActive,
        rates: zone.rates.map((rate) => ({
          id: rate.id,
          name: rate.name,
          price: Number(rate.price),
          minOrder: rate.minOrder ? Number(rate.minOrder) : null,
          maxOrder: rate.maxOrder ? Number(rate.maxOrder) : null,
          estimatedDays: rate.estimatedDays,
        })),
      }))}
    />
  );
}
