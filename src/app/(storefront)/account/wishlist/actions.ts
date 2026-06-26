"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function removeFromWishlist(productId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  await prisma.wishlistItem.deleteMany({
    where: { userId: session.user.id, productId },
  });

  revalidatePath("/account/wishlist");
  return { success: true };
}
