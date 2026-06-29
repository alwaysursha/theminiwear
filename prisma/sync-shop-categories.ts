import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import "dotenv/config";
import {
  resolveProductCategorySlug,
  SHOP_CATEGORY_SEED_DATA,
} from "../src/lib/shop-categories";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  for (const category of SHOP_CATEGORY_SEED_DATA) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      create: category,
      update: {
        name: category.name,
        description: category.description,
      },
    });
    console.log(`Synced category: ${category.name}`);
  }

  const categories = await prisma.category.findMany({
    where: { slug: { in: SHOP_CATEGORY_SEED_DATA.map((category) => category.slug) } },
  });
  const categoryBySlug = Object.fromEntries(
    categories.map((category) => [category.slug, category]),
  );

  const products = await prisma.product.findMany({
    include: { variants: true },
  });

  for (const product of products) {
    const slug = resolveProductCategorySlug(
      product.gender,
      product.variants.map((variant) => variant.ageGroup),
    );
    const category = categoryBySlug[slug];
    if (!category) continue;

    if (product.categoryId !== category.id) {
      await prisma.product.update({
        where: { id: product.id },
        data: { categoryId: category.id },
      });
      console.log(`Reassigned ${product.slug} -> ${slug}`);
    }
  }

  const legacySlugs = [
    "bodysuits",
    "dresses",
    "tops-tees",
    "bottoms",
    "outerwear",
    "sleepwear",
    "swimwear",
    "accessories",
  ];

  const removed = await prisma.category.deleteMany({
    where: { slug: { in: legacySlugs } },
  });
  if (removed.count > 0) {
    console.log(`Removed ${removed.count} legacy categories`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
