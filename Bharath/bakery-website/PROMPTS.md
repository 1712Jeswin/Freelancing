# Bakery Website Project Prompts

This document contains step-by-step prompt modules to build a modern full-stack e-commerce web application for a bakery.

## Module 1 — Project Setup and Architecture
Create a modern fullstack ecommerce web application using the following stack:

**Framework:**
- Next.js 14+ with App Router
- TypeScript

**Styling:**
- TailwindCSS
- Shadcn UI components
- Lucide icons

**Architecture:**
- Feature-based folder structure
- Server Components by default
- Client components only when necessary

**Integrations:**
- Clerk for authentication
- Neon PostgreSQL for database
- Drizzle ORM for database queries
- Zod for schema validation
- TanStack React Query for client data fetching

**Developer tools:**
- ESLint
- Prettier
- Environment variable management

**Tasks:**
1. Create a clean and scalable base directory structure:
   - `/app`
   - `/modules`
   - `/components`
   - `/lib`
   - `/db`
   - `/hooks`
   - `/providers`
   - `/types`
   - `/config`
2. Install and configure Tailwind, Shadcn UI, and required dependencies.
3. Ensure the application runs successfully with `pnpm dev`.

---

## Module 2 — Database Setup (Neon + Drizzle)
Setup a PostgreSQL database connection using Neon and Drizzle ORM.

**Tasks:**
1. Install required dependencies:
   - `drizzle-orm`
   - `drizzle-kit`
   - `pg`
   - `dotenv`
2. Configure Drizzle with Neon PostgreSQL.
3. Create database connection in `/db/index.ts`.
4. Setup `drizzle.config.ts` for migrations.
5. Use environment variable: `DATABASE_URL=`
6. Create the following tables and fields:
   - **`users`**: `id` (uuid primary key), `clerk_id`, `email`, `name`, `created_at`
   - **`products`**: `id`, `name`, `description`, `price`, `image_url`, `category_id`, `created_at`
   - **`categories`**: `id`, `name`, `slug`
   - **`cart_items`**: `id`, `user_id`, `product_id`, `quantity`
   - **`orders`**: `id`, `user_id`, `total_price`, `status`, `created_at`
   - **`order_items`**: `id`, `order_id`, `product_id`, `quantity`, `price`
7. Generate drizzle schema and migration files. Ensure the schema is properly typed.

---

## Module 3 — Authentication (Clerk)
Implement authentication using Clerk.

**Requirements:**
- **Pages:** Login, Register, Protected Dashboard
- **Routes:** `/login`, `/register`, `/dashboard`

**Tasks:**
1. Install Clerk SDK for Next.js.
2. Wrap the application in `ClerkProvider`.
3. Use Clerk middleware to protect private routes. Only authenticated users should access dashboard routes.
4. Use Shadcn UI components for layout.
5. Auth flow: Landing Page → Login / Register → Redirect to Dashboard after successful authentication.
6. Store the Clerk user ID in the database when a new user signs in for the first time.

---

## Module 4 — Landing Page
Create a modern landing page for a bakery ecommerce platform. Use Shadcn UI components and TailwindCSS. The design should feel modern and premium like a bakery brand.

**Sections:**
1. **Hero Section:** Bakery brand title, Tagline, CTA button ("Shop Now").
2. **Featured Products Section:** Cakes, Brownies, Desserts, Juices.
3. **About Section:** Small bakery description.
4. **Footer**

**Navigation bar should include:**
- Home
- Products
- Login
- Register

**Actions:**
- Clicking "Shop Now" redirects authenticated users to the dashboard.
- Unauthenticated users should be redirected to login.

---

## Module 5 — Product Catalog (Dashboard)
Create the main ecommerce dashboard to display bakery products such as Cakes, Desserts, Brownies, and Juices.

**Structure:**
- `/dashboard`
- `/modules/products`
- `/modules/categories`

**Tasks:**
1. Fetch product data from the database using Drizzle.
2. Display products in a responsive grid layout. Use Shadcn for UI components.
3. Each product card should show: Product image, Product name, Price, "Add to Cart" button.
4. Implement features:
   - Category filtering
   - Search bar
   - Pagination or infinite scroll

---

## Module 6 — Shopping Cart
Implement a shopping cart system. The cart should be user-specific. Use TanStack React Query for fetching and updating cart state.

**Database table:** `cart_items`
**UI Route:** `/cart`

**Features:**
Users can:
- Add items to cart
- Remove items from cart
- Increase or decrease quantity
- View total price

**Cart page should display:**
- Product Image
- Product Name
- Quantity selector
- Price
- Remove button
- Dynamically calculated cart totals.

---

## Module 7 — Order System
Implement order creation.

**Workflow:**
User → Cart → Checkout → Order created

**Tasks:**
1. When checkout is clicked:
   - Create an `orders` record.
   - Create `order_items` entries.
2. Clear the user's cart.
3. Redirect to `/orders`.

**Orders page (`/orders`) should show:**
- Order ID
- Order date
- Order status
- Total price
- Ability to view order details for each order.

---

## Module 8 — UI Design System
Setup a consistent UI design system using Shadcn UI. Ensure a responsive layout using Tailwind, following a modern ecommerce UI similar to Amazon or Shopify.

**Use the following components:**
Card, Button, Input, Dialog, Sheet, Toast, Dropdown Menu, Badge

**Create reusable components:**
- `ProductCard`
- `Navbar`
- `CategoryFilter`
- `CartButton`
- `OrderCard`

---

## Module 9 — Stitch MCP Integration
Integrate Stitch MCP server to assist with UI generation and component composition. Ensure Stitch works natively with Next.js App Router, TailwindCSS, and Shadcn UI.

**Use Stitch to:**
- Generate UI layouts
- Auto-create Shadcn components
- Assist in responsive layout adjustments

**Tasks:**
- Provide developer commands to generate components via Stitch MCP.

---

## Module 10 — Future Enhancements
Prepare the architecture for future features to ensure easy expansion.

**Upcoming Features to support:**
- Payment integration (Razorpay)
- Admin dashboard (Add/Edit/Delete products, Manage orders)
- Product reviews
- Wishlist system
- Coupon codes
- Inventory tracking