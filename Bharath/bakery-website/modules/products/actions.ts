"use server";

import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { ilike, eq, and, desc } from "drizzle-orm";

export async function getProducts({
  query,
  categoryId,
}: {
  query?: string;
  categoryId?: string;
}) {
  try {
    // Start building our query conditions dynamically
    const conditions = [];

    if (query) {
      conditions.push(ilike(products.name, `%${query}%`));
    }

    if (categoryId && categoryId !== "all") {
      conditions.push(eq(products.category_id, categoryId));
    }

    // Execute the database request
    const dbProducts = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        price_quarter: products.price_quarter,
        price_half: products.price_half,
        price_one_half: products.price_one_half,
        price_two: products.price_two,
        image_url: products.image_url,
        category: categories.name,
        created_at: products.created_at,
      })
      .from(products)
      .leftJoin(categories, eq(products.category_id, categories.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(products.created_at));

    return dbProducts;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}
