"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Gender, type Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { flashAdminSaved } from "@/lib/admin-save-flash";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { ageGroupForSize, sortShopCategories } from "@/lib/shop-categories";

export type ProductVariantInput = {
  id?: string;
  size: string;
  color: string;
  ageGroup: string;
  sku: string;
  price: string;
  salePrice?: string;
  stock: string;
};

export type ProductImageInput = {
  id?: string;
  url: string;
  alt?: string;
  /** Color this image represents (empty = shown for every color). */
  color?: string;
  sortOrder?: string;
};

function parseProductFormData(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const gender = (formData.get("gender") as Gender) || Gender.UNISEX;
  const occasion = (formData.get("occasion") as string) || null;
  const categoryId = (formData.get("categoryId") as string) || null;
  const isNewArrival = formData.get("isNewArrival") === "on";
  const isTrending = formData.get("isTrending") === "on";
  const isOnSale = formData.get("isOnSale") === "on";
  const isClearance = formData.get("isClearance") === "on";
  const isActive = formData.get("isActive") !== "off";
  const salePercentRaw = (formData.get("salePercent") as string)?.trim();
  const salePercent = salePercentRaw ? parseInt(salePercentRaw, 10) : null;
  const saleEndsAtRaw = (formData.get("saleEndsAt") as string)?.trim();
  const saleEndsAt = saleEndsAtRaw ? new Date(saleEndsAtRaw) : null;

  const variantsJson = formData.get("variants") as string;
  const imagesJson = formData.get("images") as string;

  const variants: ProductVariantInput[] = variantsJson
    ? JSON.parse(variantsJson)
    : [];
  const images: ProductImageInput[] = imagesJson ? JSON.parse(imagesJson) : [];

  return {
    name,
    description,
    gender,
    occasion,
    categoryId: categoryId || null,
    isNewArrival,
    isTrending,
    isOnSale,
    isClearance,
    isActive,
    salePercent,
    saleEndsAt,
    variants,
    images,
  };
}

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const data = parseProductFormData(formData);
  const slug = slugify(data.name);

  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    throw new Error("A product with this name already exists");
  }

  await prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      gender: data.gender,
      occasion: data.occasion,
      categoryId: data.categoryId,
      isNewArrival: data.isNewArrival,
      isTrending: data.isTrending,
      isOnSale: data.isOnSale,
      isClearance: data.isClearance,
      salePercent: data.salePercent,
      saleEndsAt: data.saleEndsAt,
      isActive: data.isActive,
      images: {
        create: data.images.map((img, index) => ({
          url: img.url,
          alt: img.alt || data.name,
          color: img.color?.trim() ? img.color.trim() : null,
          sortOrder: img.sortOrder ? parseInt(img.sortOrder, 10) : index,
        })),
      },
      variants: {
        create: data.variants.map((v) => ({
          size: v.size,
          color: v.color,
          ageGroup: v.ageGroup?.trim() || ageGroupForSize(v.size),
          sku: v.sku,
          price: parseFloat(v.price),
          salePrice: v.salePrice?.trim() ? parseFloat(v.salePrice) : null,
          stock: parseInt(v.stock, 10) || 0,
        })),
      },
    },
  });

  revalidatePath("/admin/products");
  await flashAdminSaved();
  redirect("/admin/products");
}

export async function updateProduct(productId: string, formData: FormData) {
  await requireAdmin();

  const data = parseProductFormData(formData);

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true, images: true },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const slug = slugify(data.name);
  if (slug !== product.slug) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      throw new Error("A product with this name already exists");
    }
  }

  const submittedVariantIds = data.variants
    .map((v) => v.id)
    .filter(Boolean) as string[];
  const variantsToDelete = product.variants.filter(
    (v) => !submittedVariantIds.includes(v.id),
  );

  const submittedImageIds = data.images
    .map((img) => img.id)
    .filter(Boolean) as string[];
  const imagesToDelete = product.images.filter(
    (img) => !submittedImageIds.includes(img.id),
  );

  await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        slug,
        description: data.description,
        gender: data.gender,
        occasion: data.occasion,
        categoryId: data.categoryId,
        isNewArrival: data.isNewArrival,
        isTrending: data.isTrending,
        isOnSale: data.isOnSale,
        isClearance: data.isClearance,
        salePercent: data.salePercent,
        saleEndsAt: data.saleEndsAt,
        isActive: data.isActive,
      },
    }),
    ...variantsToDelete.map((v) =>
      prisma.productVariant.delete({ where: { id: v.id } }),
    ),
    ...imagesToDelete.map((img) =>
      prisma.productImage.delete({ where: { id: img.id } }),
    ),
  ]);

  for (const variant of data.variants) {
    const variantData = {
      size: variant.size,
      color: variant.color,
      ageGroup: variant.ageGroup?.trim() || ageGroupForSize(variant.size),
      sku: variant.sku,
      price: parseFloat(variant.price),
      salePrice: variant.salePrice?.trim()
        ? parseFloat(variant.salePrice)
        : null,
      stock: parseInt(variant.stock, 10) || 0,
    };

    if (variant.id) {
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: variantData,
      });
    } else {
      await prisma.productVariant.create({
        data: { ...variantData, productId },
      });
    }
  }

  for (const [index, image] of data.images.entries()) {
    const imageData = {
      url: image.url,
      alt: image.alt || data.name,
      color: image.color?.trim() ? image.color.trim() : null,
      sortOrder: image.sortOrder ? parseInt(image.sortOrder, 10) : index,
    };

    if (image.id) {
      await prisma.productImage.update({
        where: { id: image.id },
        data: imageData,
      });
    } else {
      await prisma.productImage.create({
        data: { ...imageData, productId },
      });
    }
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}/edit`);
  await flashAdminSaved();
  redirect("/admin/products");
}

export async function deleteProduct(productId: string) {
  await requireAdmin();

  await prisma.product.delete({ where: { id: productId } });

  revalidatePath("/admin/products");
  await flashAdminSaved();
}

export async function toggleProductActive(productId: string) {
  await requireAdmin();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { isActive: true },
  });
  if (!product) {
    throw new Error("Product not found");
  }

  await prisma.product.update({
    where: { id: productId },
    data: { isActive: !product.isActive },
  });

  revalidatePath("/admin/products");
  await flashAdminSaved();
}

export async function duplicateProduct(productId: string) {
  await requireAdmin();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true, images: true },
  });
  if (!product) {
    throw new Error("Product not found");
  }

  const base = `${slugify(product.name)}-copy`;
  let slug = base;
  let counter = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${base}-${counter++}`;
  }

  const suffix = () => Math.random().toString(36).slice(2, 7);

  await prisma.product.create({
    data: {
      name: `${product.name} (Copy)`,
      slug,
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
      isActive: false,
      images: {
        create: product.images.map((img) => ({
          url: img.url,
          alt: img.alt,
          color: img.color,
          sortOrder: img.sortOrder,
        })),
      },
      variants: {
        create: product.variants.map((v) => ({
          size: v.size,
          color: v.color,
          ageGroup: v.ageGroup,
          sku: `${v.sku}-copy-${suffix()}`,
          price: v.price,
          salePrice: v.salePrice,
          stock: v.stock,
        })),
      },
    },
  });

  revalidatePath("/admin/products");
  await flashAdminSaved();
}

export async function getCategories() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return sortShopCategories(categories);
}

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: { variants: true; images: true; category: true };
}>;
