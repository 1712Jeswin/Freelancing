"use server";

import { db } from "@/../db";
import { orders, order_items, products, users } from "@/../db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getOrders() {
  const allOrders = await db
    .select({
      id: orders.id,
      user_id: orders.user_id,
      user_name: users.name,
      user_email: users.email,
      status: orders.status,
      total_price: orders.total_price,
      payment_method: orders.payment_method,
      payment_status: orders.payment_status,
      created_at: orders.created_at,
    })
    .from(orders)
    .leftJoin(users, eq(orders.user_id, users.id))
    .orderBy(desc(orders.created_at));

  return allOrders;
}

export async function getOrderDetails(orderId: string) {
  const [order] = await db
    .select({
      id: orders.id,
      user_name: users.name,
      user_email: users.email,
      status: orders.status,
      total_price: orders.total_price,
      subtotal: orders.subtotal,
      tax_amount: orders.tax_amount,
      shipping_cost: orders.shipping_cost,
      shipping_address: orders.shipping_address, // Contains the phone_number
      payment_method: orders.payment_method,
      payment_status: orders.payment_status,
      cancellation_reason: orders.cancellation_reason,
      cancellation_details: orders.cancellation_details,
      delivery_date: orders.delivery_date,
      created_at: orders.created_at,
    })
    .from(orders)
    .leftJoin(users, eq(orders.user_id, users.id))
    .where(eq(orders.id, orderId));

  if (!order) return null;

  const items = await db
    .select({
      id: order_items.id,
      product_id: order_items.product_id,
      quantity: order_items.quantity,
      price: order_items.price,
      product_name: products.name,
      product_image: products.image_url,
    })
    .from(order_items)
    .leftJoin(products, eq(order_items.product_id, products.id))
    .where(eq(order_items.order_id, orderId));

  return { ...order, items };
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    await db.update(orders).set({ status }).where(eq(orders.id, orderId));
    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update status." };
  }
}

export async function updatePaymentStatus(orderId: string, payment_status: string) {
  try {
    await db.update(orders).set({ payment_status }).where(eq(orders.id, orderId));
    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update payment status." };
  }
}
