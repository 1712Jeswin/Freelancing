"use server";

import { db } from "@/db";
import { reviews, users, orders, order_items } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getInternalUserId } from "@/lib/auth";

export async function getProductReviews(productId: string) {
  try {
    const data = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        created_at: reviews.created_at,
        user: {
          name: users.name,
        }
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.user_id, users.id))
      .where(eq(reviews.product_id, productId))
      .orderBy(desc(reviews.created_at));

    return data;
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return [];
  }
}

export async function hasPurchasedProduct(productId: string) {
  try {
    const userId = await getInternalUserId();
    if (!userId) return false;

    // Check if there is any delivered/shipped/processing order with this product
    // Or just any successful order essentially.
    const [purchased] = await db
      .select({ id: order_items.id })
      .from(order_items)
      .innerJoin(orders, eq(order_items.order_id, orders.id))
      .where(
        and(
          eq(orders.user_id, userId),
          eq(order_items.product_id, productId),
          // We can optionally check if payment_status === "paid" or "cod", 
          // but for simplicity, any order_item tied to this user works as proof of intent or purchase.
        )
      )
      .limit(1);

    return !!purchased;
  } catch (error) {
    console.error("Failed to check purchase status:", error);
    return false;
  }
}

export async function hasAlreadyReviewed(productId: string) {
  try {
    const userId = await getInternalUserId();
    if (!userId) return false;

    const [existing] = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(
        and(
          eq(reviews.user_id, userId),
          eq(reviews.product_id, productId)
        )
      )
      .limit(1);

    return !!existing;
  } catch (error) {
    console.error("Failed to check review status:", error);
    return false;
  }
}


export async function addProductReview(data: {
  productId: string;
  rating: number;
  comment?: string;
}) {
  try {
    const userId = await getInternalUserId();
    if (!userId) throw new Error("Unauthorized");

    const purchased = await hasPurchasedProduct(data.productId);
    if (!purchased) throw new Error("You must purchase this product to review it.");

    const existing = await hasAlreadyReviewed(data.productId);
    if (existing) throw new Error("You have already reviewed this product.");

    await db.insert(reviews).values({
      product_id: data.productId,
      user_id: userId,
      rating: data.rating,
      comment: data.comment,
    });

    revalidatePath(`/products/${data.productId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add review:", error);
    return { success: false, error: error.message || "Failed to add review" };
  }
}
