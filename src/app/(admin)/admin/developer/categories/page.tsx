import { prisma } from "@/lib/prisma";
import { createCategory } from "@/lib/actions/developer";
import { CategoryManager } from "@/components/admin/developer/CategoryManager";

export const dynamic = "force-dynamic";

export default async function DeveloperCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <CategoryManager
      createCategory={createCategory}
      categories={categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        productCount: cat._count.products,
      }))}
    />
  );
}
