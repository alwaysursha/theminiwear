import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  getCategories,
  updateProduct,
} from "@/lib/actions/products";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { variants: true, images: true },
    }),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  const boundUpdate = updateProduct.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>
        <h2 className="text-2xl font-semibold text-slate-900">
          Edit product
        </h2>
        <p className="text-sm text-slate-500">{product.name}</p>
      </div>

      <ProductForm
        action={boundUpdate}
        categories={categories}
        submitLabel="Update product"
        initialData={{
          name: product.name,
          description: product.description,
          gender: product.gender,
          occasion: product.occasion,
          categoryId: product.categoryId,
          isNewArrival: product.isNewArrival,
          isTrending: product.isTrending,
          isOnSale: product.isOnSale,
          isClearance: product.isClearance,
          salePercent: product.salePercent,
          saleEndsAt: product.saleEndsAt,
          isActive: product.isActive,
          variants: product.variants.map((v) => ({
            id: v.id,
            size: v.size,
            color: v.color,
            ageGroup: v.ageGroup,
            sku: v.sku,
            price: String(v.price),
            salePrice: v.salePrice ? String(v.salePrice) : "",
            stock: String(v.stock),
          })),
          images: product.images.map((img) => ({
            id: img.id,
            url: img.url,
            alt: img.alt ?? "",
            sortOrder: String(img.sortOrder),
          })),
        }}
      />
    </div>
  );
}
