"use server";

import { db } from "@/../db";
import { products, categories, cart_items, order_items } from "@/../db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getProducts() {
  const allProducts = await db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      image_url: products.image_url,
      category_id: products.category_id,
      category_name: categories.name,
      created_at: products.created_at,
    })
    .from(products)
    .leftJoin(categories, eq(products.category_id, categories.id))
    .orderBy(desc(products.created_at));

  return allProducts;
}

export async function getProduct(id: string) {
  const [product] = await db.select().from(products).where(eq(products.id, id));
  return product;
}

export async function getCategories() {
  return await db.select().from(categories);
}

export async function createProduct(data: {
  name: string;
  description: string;
  price: string;
  price_quarter?: string;
  price_half?: string;
  price_one_half?: string;
  price_two?: string;
  image_url: string;
  category_id: string;
}) {
  try {
    await db.insert(products).values({
      name: data.name,
      description: data.description,
      price: data.price,
      price_quarter: data.price_quarter || null,
      price_half: data.price_half || null,
      price_one_half: data.price_one_half || null,
      price_two: data.price_two || null,
      image_url: data.image_url,
      category_id: data.category_id || null,
    });
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Failed to create product:", error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateProduct(id: string, data: {
  name: string;
  description: string;
  price: string;
  price_quarter?: string;
  price_half?: string;
  price_one_half?: string;
  price_two?: string;
  image_url: string;
  category_id: string;
}) {
  try {
    await db.update(products).set({
      name: data.name,
      description: data.description,
      price: data.price,
      price_quarter: data.price_quarter || null,
      price_half: data.price_half || null,
      price_one_half: data.price_one_half || null,
      price_two: data.price_two || null,
      image_url: data.image_url,
      category_id: data.category_id || null,
    }).where(eq(products.id, id));
    revalidatePath("/products");
    revalidatePath(`/products/${id}/edit`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update product:", error);
    return { success: false, error: "Failed to update product" };
  }
}

export async function deleteProduct(id: string) {
  try {
    // Manually handle constraints:
    // 1. Remove from carts
    await db.delete(cart_items).where(eq(cart_items.product_id, id));
    
    // 2. Set product_id to null in historical orders so we don't break them
    await db.update(order_items).set({ product_id: null }).where(eq(order_items.product_id, id));

    // 3. Delete the product
    await db.delete(products).where(eq(products.id, id));
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { success: false, error: "Failed to delete product" };
  }
}
