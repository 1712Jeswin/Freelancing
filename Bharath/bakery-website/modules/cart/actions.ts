"use server";

import { db } from "@/db";
import { cart_items, products, users } from "@/db/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";

import { getInternalUserId } from "@/lib/auth";

export async function getCart() {
  try {
    const userId = await getInternalUserId();
    if (!userId) return { items: [] };

    const items = await db
      .select({
        id: cart_items.id,
        quantity: cart_items.quantity,
        weight: cart_items.weight,
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
          price_quarter: products.price_quarter,
          price_half: products.price_half,
          price_one_half: products.price_one_half,
          price_two: products.price_two,
          image_url: products.image_url,
        },
      })
      .from(cart_items)
      .innerJoin(products, eq(cart_items.product_id, products.id))
      .where(eq(cart_items.user_id, userId));

    const itemsWithComputedPrice = items.map(item => {
      let computedPrice = Number(item.product.price);
      if (item.weight === "1/4kg") {
        computedPrice = item.product.price_quarter ? Number(item.product.price_quarter) : computedPrice * 0.25;
      } else if (item.weight === "1/2kg") {
        computedPrice = item.product.price_half ? Number(item.product.price_half) : computedPrice * 0.5;
      } else if (item.weight === "1.5kg") {
        computedPrice = item.product.price_one_half ? Number(item.product.price_one_half) : computedPrice * 1.5;
      } else if (item.weight === "2kg") {
        computedPrice = item.product.price_two ? Number(item.product.price_two) : computedPrice * 2;
      }

      return {
        ...item,
        product: {
          ...item.product,
          price: computedPrice.toFixed(2),
        }
      };
    });

    console.log(`getCart: Found ${items.length} items for user ${userId}`);
    return { items: itemsWithComputedPrice };
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    return { items: [] };
  }
}

export async function addToCart({ productId, quantity = 1, weight = "1kg" }: { productId: string; quantity?: number; weight?: string }) {
  try {
    const userId = await getInternalUserId();
    if (!userId) throw new Error("Unauthorized");

    // Check if the item already exists in the cart with the same weight
    const [existingItem] = await db
      .select()
      .from(cart_items)
      .where(and(eq(cart_items.user_id, userId), eq(cart_items.product_id, productId), eq(cart_items.weight, weight)));

    if (existingItem) {
      // Update quantity
      const [updated] = await db
        .update(cart_items)
        .set({ quantity: existingItem.quantity + quantity })
        .where(eq(cart_items.id, existingItem.id))
        .returning();
      return { success: true, item: updated };
    } else {
      // Insert new
      const [inserted] = await db.insert(cart_items).values({
        user_id: userId,
        product_id: productId,
        quantity,
        weight,
      }).returning();
      return { success: true, item: inserted };
    }
  } catch (error) {
    console.error("Failed to add to cart:", error);
    return { success: false, error: "Failed to add to cart" };
  }
}

export async function updateCartItemQuantity({ cartItemId, quantity }: { cartItemId: string; quantity: number }) {
  try {
    const userId = await getInternalUserId();
    if (!userId) throw new Error("Unauthorized");

    if (quantity <= 0) {
      return removeFromCart(cartItemId);
    }

    // Ensure user owns this cart item structurally implicitly or do an explicit check
    const [item] = await db.select().from(cart_items).where(eq(cart_items.id, cartItemId));
    if (!item || item.user_id !== userId) throw new Error("Unauthorized or not found");

    await db
      .update(cart_items)
      .set({ quantity })
      .where(eq(cart_items.id, cartItemId));

    return { success: true };
  } catch (error) {
    console.error("Failed to update quantity:", error);
    return { success: false, error: "Failed to update quantity" };
  }
}

export async function removeFromCart(cartItemId: string) {
  try {
    const userId = await getInternalUserId();
    if (!userId) throw new Error("Unauthorized");

    // Ensure user owns this cart item implicitly or explicitly
    const [item] = await db.select().from(cart_items).where(eq(cart_items.id, cartItemId));
    if (!item || item.user_id !== userId) throw new Error("Unauthorized or not found");

    await db.delete(cart_items).where(eq(cart_items.id, cartItemId));

    return { success: true };
  } catch (error) {
    console.error("Failed to remove from cart:", error);
    return { success: false, error: "Failed to remove from cart" };
  }
}
