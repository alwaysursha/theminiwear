import Link from "next/link";
import {
  Boxes,
  CheckCircle2,
  PackageX,
  Plus,
  Tag,
  TriangleAlert,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getProductPriceRange } from "@/lib/product-utils";
import { getSiteSaleSettings } from "@/lib/settings";
import { MetricCard } from "@/components/admin/dashboard/MetricCard";
import {
  ProductsManager,
  type AdminProductRow,
} from "@/components/admin/products/ProductsManager";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, siteSale, categories] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: true,
        variants: true,
        images: { take: 1, orderBy: { sortOrder: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    }),
    getSiteSaleSettings(),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const rows: AdminProductRow[] = products.map((product) => {
    const pricing = getProductPriceRange(product.variants, product, siteSale);
    const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
    const compareAtMin =
      "compareAtMin" in pricing ? pricing.compareAtMin : null;
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0]?.url ?? null,
      categoryId: product.categoryId,
      categoryName: product.category?.name ?? null,
      variantCount: product.variants.length,
      totalStock,
      priceDisplay: pricing.display,
      minPrice: pricing.minCurrent,
      hasSale: pricing.hasSale,
      compareAtMin: compareAtMin ?? null,
      isActive: product.isActive,
      isOnSale: product.isOnSale,
      isClearance: product.isClearance,
      isNewArrival: product.isNewArrival,
      isTrending: product.isTrending,
      salePercent: product.salePercent,
      createdAt: product.createdAt.toISOString(),
    };
  });

  const stats = {
    total: rows.length,
    active: rows.filter((r) => r.isActive).length,
    lowStock: rows.filter((r) => r.totalStock > 0 && r.totalStock <= 5).length,
    outOfStock: rows.filter((r) => r.totalStock <= 0).length,
    onSale: rows.filter((r) => r.isOnSale || r.isClearance).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Products
          </h2>
          <p className="text-sm text-slate-500">
            Manage your catalog, stock, pricing and promotions.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Add product
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard
          label="Total products"
          value={stats.total}
          icon={Boxes}
          accent="blue"
          sub={`${categories.length} categories`}
        />
        <MetricCard
          label="Active"
          value={stats.active}
          icon={CheckCircle2}
          accent="emerald"
          sub={`${stats.total - stats.active} inactive`}
        />
        <MetricCard
          label="Low stock"
          value={stats.lowStock}
          icon={TriangleAlert}
          accent="amber"
          sub="5 or fewer left"
        />
        <MetricCard
          label="Out of stock"
          value={stats.outOfStock}
          icon={PackageX}
          accent="rose"
          sub="Needs restock"
        />
        <MetricCard
          label="On promo"
          value={stats.onSale}
          icon={Tag}
          accent="violet"
          sub="Sale or clearance"
        />
      </div>

      <ProductsManager
        products={rows}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
