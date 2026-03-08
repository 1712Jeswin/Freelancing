import { db } from "../db";
import { cart_items, users, products } from "../db/schema";
import { eq } from "drizzle-orm";

async function check() {
  console.log("--- Checking Database Consistency ---");
  
  const allUsers = await db.select().from(users);
  console.log("Total Users:", allUsers.length);
  allUsers.forEach(u => console.log(`- User: ${u.name} (clerk_id: ${u.clerk_id}, id: ${u.id})`));
  
  const allProducts = await db.select().from(products);
  console.log("\nTotal Products:", allProducts.length);
  allProducts.forEach(p => console.log(`- Product: ${p.name} (id: ${p.id})`));

  const allCartItems = await db.select().from(cart_items);
  console.log("\nTotal Cart Items:", allCartItems.length);
  
  for (const item of allCartItems) {
    const user = allUsers.find(u => u.id === item.user_id);
    const product = allProducts.find(p => p.id === item.product_id);
    console.log(`- Item ${item.id}: User [${user?.name || 'MISSING'}], Product [${product?.name || 'MISSING'}], Quantity: ${item.quantity}`);
  }
}

check().catch(console.error);
