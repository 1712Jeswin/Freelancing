# 🚀 Future Features Architecture Roadmap

This document outlines the architectural plan for scaling "Rizu Cake World" e-commerce application with advanced features. 

## 1. Payment Integration (Razorpay)
**Goal:** Transition from simulated checkout to real-world payments.
- **Database:**
  - Add `razorpay_order_id` (text), `razorpay_payment_id` (text), and `payment_status` (varchar) to the `orders` table.
- **Workflow:**
  - In `modules/orders/actions.ts`, generate a Razorpay Order ID instead of immediate direct order creation.
  - Set order status to `awaiting_payment`.
  - Implement an API route (`/api/webhooks/razorpay`) to verify the Razorpay signature and listen for `payment.captured` events to finalize the order and clear the cart.

## 2. Admin Dashboard (Separate Project)
**Goal:** Empower staff to manage products, categories, and fulfill orders via a standalone administration app.
- **Architecture:**
  - Create a completely separate Next.js project for the admin dashboard.
  - Connect directly to the existing Neon PostgreSQL database (sharing the same schema).
- **Access Control:**
  - No authentication required for this phase.
- **Features:**
  - **Products:** CRUD operations for managing bakery items using Shadcn UI data tables.
  - **Orders:** View and update order statuses (e.g., Awaiting Payment → Processing → Shipped → Delivered).
  - **Customers:** Admin must also be able to look at user contact information (phone number, address) attached to orders.

## ~~3. Product Reviews & Ratings~~
**Goal:** Build social proof and customer trust. (COMPLETED)
- **Database:**
  - `reviews`: `id`, `user_id`, `product_id`, `rating` (integer 1-5), `comment` (text), `created_at`.
- **UI:**
  - `ReviewList` component on the product details page.
  - `StarRating` input component for authenticated users who have purchased the product.

## 4. Wishlist System
**Goal:** Allow users to save favorites for later.
- **Database:**
  - `wishlist_items`: `id`, `user_id`, `product_id`.
- **Integration:** 
  - Reuse `ProductCard` with a "Heart" toggle button.
  - Use React Query for optimistic UI updates.

## 5. Coupons & Promotions
**Goal:** Drive sales with discounts.
- **Database:**
  - `coupons`: `id`, `code` (unique), `discount_type` (fixed/percentage), `discount_value`, `expires_at`, `usage_limit`.
- **Logic:**
  - Update `CartSummary` to include a promo code input.
  - Update `orders` table to log `applied_coupon_id` and `discount_amount`.

## 6. Inventory Tracking
**Goal:** Prevent overselling and manage stock levels.
- **Database:**
  - Add `stock_quantity` (integer) to the `products` table.
- **Implementation:**
  - Use **Drizzle Transactions** during checkout to check and decrement stock levels.
  - UI: Show "Out of Stock" badge on `ProductCard` if `stock_quantity <= 0`.
