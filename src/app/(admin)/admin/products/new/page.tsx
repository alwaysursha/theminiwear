import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createProduct, getCategories } from "@/lib/actions/products";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getCategories();

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
          Create product
        </h2>
        <p className="text-sm text-slate-500">
          Add a new product with variants and images
        </p>
      </div>

      <ProductForm
        action={createProduct}
        categories={categories}
        submitLabel="Create product"
      />
    </div>
  );
}
