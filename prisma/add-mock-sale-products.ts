import { PrismaPg } from "@prisma/adapter-pg";
import { Gender, PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import "dotenv/config";
import { seedImages } from "./seed-images";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const saleProducts = [
  {
    name: "Mint Meadow Sundress",
    slug: "mint-meadow-sundress",
    description:
      "Breezy cotton sundress in a soft mint floral. Easy pull-on style for warm days.",
    gender: Gender.GIRLS,
    occasion: "Everyday",
    isNewArrival: false,
    isTrending: false,
    trendingScore: 71,
    isOnSale: true,
    salePercent: 28,
    categorySlug: "dresses",
    images: [...seedImages.products.mintMeadowSundress],
    variants: [
      { size: "2T", color: "Mint", ageGroup: "2T", price: 29.99, stock: 28 },
      { size: "3T", color: "Mint", ageGroup: "3T", price: 29.99, stock: 24 },
      { size: "4T", color: "Mint", ageGroup: "4T", price: 31.99, stock: 20 },
    ],
  },
  {
    name: "Cloud Knit Beanie Set",
    slug: "cloud-knit-beanie-set",
    description:
      "Two-pack ribbed knit beanies with fold-over cuff. Soft stretch for growing heads.",
    gender: Gender.UNISEX,
    occasion: "Everyday",
    isNewArrival: false,
    isTrending: false,
    trendingScore: 63,
    isOnSale: true,
    salePercent: 22,
    categorySlug: "accessories",
    images: [...seedImages.products.cloudKnitBeanieSet],
    variants: [
      { size: "0-12M", color: "Cream", ageGroup: "0-12M", price: 19.99, stock: 45 },
      { size: "12-24M", color: "Blush", ageGroup: "12-24M", price: 19.99, stock: 40 },
      { size: "2T-4T", color: "Sky", ageGroup: "2T", price: 21.99, stock: 36 },
    ],
  },
  {
    name: "Peach Pocket Tee",
    slug: "peach-pocket-tee",
    description:
      "Soft cotton tee with a contrast peach pocket. Easy everyday layer for playdates.",
    gender: Gender.UNISEX,
    occasion: "Everyday",
    isNewArrival: false,
    isTrending: false,
    trendingScore: 68,
    isOnSale: true,
    salePercent: 20,
    categorySlug: "tops-tees",
    images: [...seedImages.products.peachPocketTee],
    variants: [
      { size: "2T", color: "Peach", ageGroup: "2T", price: 17.99, stock: 32 },
      { size: "3T", color: "Peach", ageGroup: "3T", price: 17.99, stock: 30 },
      { size: "4T", color: "White", ageGroup: "4T", price: 18.99, stock: 28 },
    ],
  },
  {
    name: "Mini Fleece Jogger Set",
    slug: "mini-fleece-jogger-set",
    description:
      "Matching fleece hoodie and joggers with ribbed cuffs. Cozy set for cooler mornings.",
    gender: Gender.UNISEX,
    occasion: "Everyday",
    isNewArrival: false,
    isTrending: false,
    trendingScore: 76,
    isOnSale: true,
    salePercent: 24,
    categorySlug: "bottoms",
    images: [...seedImages.products.miniFleeceJoggerSet],
    variants: [
      { size: "3T", color: "Heather", ageGroup: "3T", price: 34.99, stock: 22 },
      { size: "4T", color: "Heather", ageGroup: "4T", price: 34.99, stock: 20 },
      { size: "5T", color: "Navy", ageGroup: "5T", price: 36.99, stock: 18 },
    ],
  },
] as const;

async function main() {
  await prisma.homepageSectionConfig.updateMany({
    where: { key: "ON_SALE" },
    data: { productLimit: 6 },
  });

  for (const def of saleProducts) {
    const existing = await prisma.product.findUnique({ where: { slug: def.slug } });
    if (existing) {
      console.log(`Skip (exists): ${def.slug}`);
      continue;
    }

    const category = await prisma.category.findUnique({
      where: { slug: def.categorySlug },
    });
    if (!category) {
      throw new Error(`Category not found: ${def.categorySlug}`);
    }

    const { images, variants, categorySlug: _categorySlug, ...data } = def;

    const product = await prisma.product.create({
      data: {
        ...data,
        categoryId: category.id,
        images: {
          create: images.map((url, index) => ({
            url,
            alt: def.name,
            sortOrder: index,
          })),
        },
      },
    });

    await Promise.all(
      variants.map((variant) =>
        prisma.productVariant.create({
          data: {
            productId: product.id,
            size: variant.size,
            color: variant.color,
            ageGroup: variant.ageGroup,
            price: variant.price,
            stock: variant.stock,
            sku: `${def.slug}-${variant.size}-${variant.color}`
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, ""),
          },
        }),
      ),
    );

    console.log(`Created on-sale product: ${def.name}`);
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
