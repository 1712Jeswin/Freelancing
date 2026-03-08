"use server";

import { db } from "@/db";
import { categories } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function getCategories() {
  try {
    const allCategories = await db
      .select()
      .from(categories)
      .orderBy(desc(categories.name));

    return allCategories;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}
