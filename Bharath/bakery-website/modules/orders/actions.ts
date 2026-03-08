"use server";

import { db } from "@/db";
import { cart_items, products, orders, order_items, users, addresses } from "@/db/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq, and, desc } from "drizzle-orm";

import { getInternalUserId } from "@/lib/auth";

import Razorpay from "razorpay";

import crypto from "crypto";

export async function checkoutCart(addressId?: string, paymentMethod: "razorpay" | "cod" = "razorpay", deliveryDate?: Date) {
  try {
    const userId = await getInternalUserId();
    if (!userId) throw new Error("Unauthorized");

    // 1. Fetch current cart items with product details
    const items = await db
      .select({
        id: cart_items.id,
        quantity: cart_items.quantity,
        product_id: cart_items.product_id,
        price: products.price,
        price_quarter: products.price_quarter,
        price_half: products.price_half,
        price_one_half: products.price_one_half,
        price_two: products.price_two,
        weight: cart_items.weight,
      })
      .from(cart_items)
      .innerJoin(products, eq(cart_items.product_id, products.id))
      .where(eq(cart_items.user_id, userId));

    if (items.length === 0) {
      throw new Error("Cart is empty");
    }

    // 1.5 Calculate computed prices
    const parsedItems = items.map(item => {
      let computedPrice = Number(item.price);
      if (item.weight === "1/4kg") {
        computedPrice = item.price_quarter ? Number(item.price_quarter) : computedPrice * 0.25;
      } else if (item.weight === "1/2kg") {
        computedPrice = item.price_half ? Number(item.price_half) : computedPrice * 0.5;
      } else if (item.weight === "1.5kg") {
        computedPrice = item.price_one_half ? Number(item.price_one_half) : computedPrice * 1.5;
      } else if (item.weight === "2kg") {
        computedPrice = item.price_two ? Number(item.price_two) : computedPrice * 2;
      }
      return { ...item, computedPrice };
    });

    // 2. Calculate total price
    const totalPrice = parsedItems.reduce((acc, item) => {
      return acc + (item.computedPrice * item.quantity);
    }, 0);

    const shipping_cost = 5.00;
    const subtotal = totalPrice;
    const tax_amount = subtotal * 0.18; // 18% GST
    const final_total = subtotal + tax_amount + shipping_cost;

    // 2.5 Fetch Address Snapshot
    let addressSnapshot = "No address provided";
    if (addressId) {
      const [address] = await db.select().from(addresses).where(eq(addresses.id, addressId));
      if (address) {
        addressSnapshot = `${address.recipient_name} | Phone: ${address.phone_number}\n${address.street_address}\n${address.city}, ${address.state} ${address.postal_code}\n${address.country}`;
      }
    }

    let razorpayOrderId = null;
    let initialStatus = "pending";
    let initialPaymentStatus = "pending";
    const amountInCents = Math.round(final_total * 100);

    if (paymentMethod === "razorpay") {
      // 3. Initialize Razorpay Order
      const razorpay = new Razorpay({
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
      });

      const razorpayOrder = await razorpay.orders.create({
        amount: amountInCents,
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
      });
      razorpayOrderId = razorpayOrder.id;
      initialStatus = "awaiting_payment";
      initialPaymentStatus = "pending";
    } else if (paymentMethod === "cod") {
      initialStatus = "processing";
      initialPaymentStatus = "cod";
    }

    // 4. Create the Order
    const [order] = await db.insert(orders).values({
      user_id: userId,
      shipping_address: addressSnapshot,
      subtotal: subtotal.toFixed(2),
      tax_amount: tax_amount.toFixed(2),
      shipping_cost: shipping_cost.toFixed(2),
      total_price: final_total.toFixed(2),
      status: initialStatus,
      payment_method: paymentMethod,
      payment_status: initialPaymentStatus,
      razorpay_order_id: razorpayOrderId,
      delivery_date: deliveryDate || new Date(Date.now() + 86400000), // Default to tomorrow if not provided
    }).returning();

    try {
      // 5. Create Order Items
      const orderItemsToInsert = parsedItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.computedPrice.toFixed(2),
        weight: item.weight,
      }));

      await db.insert(order_items).values(orderItemsToInsert);

      if (paymentMethod === "cod") {
        // Clear cart for COD immediately
        await db.delete(cart_items).where(eq(cart_items.user_id, userId));
      }

      return { 
        success: true, 
        orderId: order.id, 
        razorpayOrderId, 
        amount: amountInCents,
        paymentMethod 
      };
    } catch (innerError: any) {
      // Manual rollback attempt since HTTP driver doesn't support transactions
      console.error("Order items failed, rolling back order:", innerError);
      await db.delete(orders).where(eq(orders.id, order.id)).catch(e => console.error("Rollback failed:", e));
      throw new Error("Failed to finalize order details");
    }
  } catch (error: any) {
    console.error("Checkout failed:", error);
    return { success: false, error: error.message || "Failed to checkout" };
  }
}

export async function verifyRazorpayPayment({
  orderCreationId,
  razorpayPaymentId,
  razorpayOrderId,
  razorpaySignature,
}: {
  orderCreationId: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}) {
  try {
    const userId = await getInternalUserId();
    if (!userId) throw new Error("Unauthorized");

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error("Razorpay secret not configured");

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpaySignature) {
      // Payment implies valid signature
      const [order] = await db.select().from(orders).where(eq(orders.id, orderCreationId));
      if (!order) throw new Error("Order not found");

      if (order.user_id !== userId) throw new Error("Unauthorized to access this order");

      // Update order status
      await db.update(orders)
        .set({
          status: "processing",
          payment_status: "paid",
          razorpay_payment_id: razorpayPaymentId,
        })
        .where(eq(orders.id, order.id));

      // Clear the user's cart
      await db.delete(cart_items).where(eq(cart_items.user_id, userId));

      return { success: true };
    } else {
      throw new Error("Invalid signature");
    }
  } catch (error: any) {
    console.error("Verification failed:", error);
    return { success: false, error: error.message || "Failed to verify signature" };
  }
}

export async function getOrders() {
  try {
    const userId = await getInternalUserId();
    if (!userId) return [];

    const userOrders = await db
      .select({
        id: orders.id,
        total_price: orders.total_price,
        status: orders.status,
        created_at: orders.created_at,
      })
      .from(orders)
      .where(eq(orders.user_id, userId))
      .orderBy(desc(orders.created_at));

    return userOrders;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
}

export async function getOrderDetails(orderId: string) {
  try {
    const userId = await getInternalUserId();
    if (!userId) return null;

    // Fetch order to verify ownership
    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.user_id, userId)));

    if (!order) return null;

    // Fetch items with product data
    const items = await db
      .select({
        id: order_items.id,
        quantity: order_items.quantity,
        weight: order_items.weight,
        historical_price: order_items.price, // the price locked in at checkout
        product: {
          id: products.id,
          name: products.name,
          image_url: products.image_url,
        }
      })
      .from(order_items)
      .innerJoin(products, eq(order_items.product_id, products.id))
      .where(eq(order_items.order_id, orderId));

    return {
      order,
      items
    };
  } catch (error) {
    console.error("Failed to fetch order details:", error);
    return null;
  }
}

export async function cancelOrder(orderId: string, reason: string, details?: string) {
  try {
    const userId = await getInternalUserId();
    if (!userId) throw new Error("Unauthorized");

    const [order] = await db.select().from(orders).where(and(eq(orders.id, orderId), eq(orders.user_id, userId)));
    if (!order) throw new Error("Order not found or unauthorized");

    if (order.status === "cancelled" || order.status === "delivered" || order.status === "shipped") {
      throw new Error("Order cannot be cancelled at this stage");
    }

    await db.update(orders)
      .set({
        status: "cancelled",
        cancellation_reason: reason,
        cancellation_details: details || null,
      })
      .where(eq(orders.id, orderId));

    return { success: true };
  } catch (error: any) {
    console.error("Failed to cancel order:", error);
    return { success: false, error: error.message || "Failed to cancel order" };
  }
}
