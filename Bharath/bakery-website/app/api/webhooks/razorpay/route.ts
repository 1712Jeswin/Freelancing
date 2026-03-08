import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { orders, cart_items } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload.payment?.entity;
      if (!paymentEntity) {
        return NextResponse.json({ received: true, note: "No payment entity found" });
      }

      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      if (razorpayOrderId) {
        // Update the order status in database
        const [updatedOrder] = await db.update(orders)
          .set({
            status: "processing", // moving from awaiting_payment to processing
            payment_status: "paid",
            razorpay_payment_id: razorpayPaymentId,
          })
          .where(eq(orders.razorpay_order_id, razorpayOrderId))
          .returning();

        if (updatedOrder) {
          // Clear the user's cart using the user_id from the order
          await db.delete(cart_items).where(eq(cart_items.user_id, updatedOrder.user_id));
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay Webhook Error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
