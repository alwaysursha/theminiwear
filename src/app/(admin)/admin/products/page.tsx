import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getProductPriceRange } from "@/lib/product-utils";
import { getSiteSaleSettings } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/DataTable";
import { deleteProduct } from "@/lib/actions/products";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, siteSale] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: true,
        variants: true,
        images: { take: 1, orderBy: { sortOrder: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    }),
    getSiteSaleSettings(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Products</h2>
          <p className="text-sm text-slate-500">
            Manage your product catalog
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button className="rounded-md bg-slate-900 text-white hover:bg-slate-800">
            <Plus className="h-4 w-4" />
            Add product
          </Button>
        </Link>
      </div>

      <DataTable
        data={products}
        getRowKey={(product) => product.id}
        columns={[
          {
            key: "name",
            header: "Product",
            render: (product) => (
              <div className="flex items-center gap-3">
                {product.images[0] && (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                )}
                <div>
                  <p className="font-medium text-slate-900">{product.name}</p>
                  <p className="text-xs text-slate-500">{product.slug}</p>
                </div>
              </div>
            ),
          },
          {
            key: "category",
            header: "Category",
            render: (product) => product.category?.name ?? "—",
          },
          {
            key: "variants",
            header: "Variants",
            render: (product) => product.variants.length,
          },
          {
            key: "stock",
            header: "Total stock",
            render: (product) =>
              product.variants.reduce((sum, v) => sum + v.stock, 0),
          },
          {
            key: "price",
            header: "Price range",
            render: (product) => {
              const pricing = getProductPriceRange(
                product.variants,
                product,
                siteSale,
              );
              return pricing.display;
            },
          },
          {
            key: "promo",
            header: "Promo",
            render: (product) => (
              <div className="flex flex-wrap gap-1">
                {product.isOnSale && (
                  <span className="rounded-full bg-blush px-2 py-0.5 text-xs font-medium text-navy">
                    Sale{product.salePercent ? ` ${product.salePercent}%` : ""}
                  </span>
                )}
                {product.isClearance && (
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs font-medium text-white">
                    Clearance
                  </span>
                )}
                {!product.isOnSale && !product.isClearance && (
                  <span className="text-slate-400">—</span>
                )}
              </div>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (product) => (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  product.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {product.isActive ? "Active" : "Inactive"}
              </span>
            ),
          },
          {
            key: "actions",
            header: "",
            className: "text-right",
            render: (product) => (
              <div className="flex justify-end gap-2">
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  Edit
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await deleteProduct(product.id);
                  }}
                >
                  <button
                    type="submit"
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </form>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
