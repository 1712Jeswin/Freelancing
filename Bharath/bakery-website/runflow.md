# Project Execution Runflow

This document provides ready-to-copy prompts for each module of Rizu Cake World website, alongside specific **Audit Checks** to verify everything was implemented correctly before moving on to the next module.

---

## Module 1: Project Setup and Architecture

### 📋 Prompt to AI:
```text
Please execute **Module 1**:
Create a modern fullstack ecommerce web application for a bakery using Next.js 14+ (App Router), TypeScript, TailwindCSS, and Shadcn UI. 

Use a feature-based folder structure with Server Components by default. We will use Clerk (auth), Neon Postgres (database), Drizzle ORM, Zod, and TanStack React Query later. Set up ESLint, Prettier, and environment variable management.

Create the following base structure:
/app, /modules, /components, /lib, /db, /hooks, /providers, /types, /config

Install and configure Tailwind, Shadcn UI, and required dependencies. Provide the setup commands and initially configured files.
```

### 🔍 Audit Checks:
- [x] Make sure `pnpm dev` runs without any errors.
- [x] Check if the directory structure (`/app`, `/modules`, `/components`, etc.) was created properly.
- [x] Verify Tailwind and Shadcn UI are correctly initialized.
- [x] Review ESLint and Prettier configs for basic setup.

---

## Module 2: Database Setup (Neon + Drizzle)

### 📋 Prompt to AI:
```text
We have our baseline setup. Please execute **Module 2**:
Setup our PostgreSQL database connection using Neon and Drizzle ORM.
1. Install `drizzle-orm`, `drizzle-kit`, `pg`, `dotenv`.
2. Configure Drizzle with Neon PostgreSQL and create the connection in `/db/index.ts`.
3. Set up `drizzle.config.ts`.
4. Create the schema for these tables:
   - users (id uuid primary key, clerk_id, email, name, created_at)
   - products (id, name, description, price, image_url, category_id, created_at)
   - categories (id, name, slug)
   - cart_items (id, user_id, product_id, quantity)
   - orders (id, user_id, total_price, status, created_at)
   - order_items (id, order_id, product_id, quantity, price)
5. Generate drizzle schema and migration files.
```

### 🔍 Audit Checks:
- [x] Ensure `DATABASE_URL` is referenced securely in `.env.local`.
- [x] Verify you can successfully run the migration command (e.g. `pnpm drizzle-kit push` or `generate`).
- [ ] Open your Neon dashboard and confirm the tables are created.
- [x] Check if the Drizzle schema files are fully typed in TypeScript.

---

## Module 3: Authentication (Clerk)

### 📋 Prompt to AI:
```text
Database is ready. Please execute **Module 3**:
Implement authentication using Clerk.
1. Install Clerk SDK for Next.js.
2. Wrap the application in `ClerkProvider`.
3. Create routes: `/login`, `/register`, `/dashboard`.
4. Use Clerk middleware to protect private routes. Only authenticated users should access `/dashboard`.
5. Auth flow: Landing Page → Login / Register → Redirect to Dashboard.
6. Crucial: Write logic to store the Clerk user ID in our database `users` table when a new user signs in for the first time.
```

### 🔍 Audit Checks:
- [x] Start the development server and navigate to `/dashboard`. You should be redirected to login.
- [ ] Sign up as a new user via Clerk UI.
- [ ] Check your Neon database `users` table to ensure the newly created user was synchronized into your database.

---

## Module 4: Landing Page

### 📋 Prompt to AI:
```text
Authentication works. Please execute **Module 4**:
Create a modern landing page for our bakery platform using Shadcn UI and TailwindCSS. The design should feel premium.
Sections to build:
1. Hero Section: Bakery brand title, Tagline, CTA button ("Shop Now").
2. Featured Products Section: Display generic cards for Cakes, Brownies, Desserts, Juices.
3. About Section: Small bakery description.
4. Footer.
Navigation bar should include: Home, Products, Login, Register.
Clicking "Shop Now" redirects authenticated users to the dashboard, and unauthenticated users to `/login`.
```

### 🔍 Audit Checks:
- [x] Ensure the landing page is visually appealing and responsive on mobile view.
- [ ] Test the "Shop Now" button while logged in and logged out to verify redirection.
- [x] Verify Shadcn components (Cards, Buttons) were properly injected and utilized.

---

## Module 5: Product Catalog (Dashboard)

### 📋 Prompt to AI:
```text
Landing page is done. Please execute **Module 5**:
Create the main ecommerce dashboard (`/dashboard`) displaying our products.
Create features in `/modules/products` and `/modules/categories`.
1. Fetch product data from our `products` table using Drizzle.
2. Display products in a responsive grid layout using Shadcn.
3. Product card should show: Image, Name, Price, and "Add to Cart" button.
4. Implement category filtering, a search bar, and basic pagination (or infinite scroll).
```

### 🔍 Audit Checks:
- [x] Manually seed some mock products and categories into the database.
- [x] Verify the products render correctly in a responsive grid on the dashboard.
- [x] Test the category filters and search bar to ensure database or client-side filtering works accurately.

---

## Module 6: Shopping Cart

### 📋 Prompt to AI:
```text
Catalog works. Please execute **Module 6**:
Implement the shopping cart system using TanStack React Query.
1. Create a user-specific cart interacting with our `cart_items` table.
2. Build the `/cart` page.
3. Ensure users can:
   - Add items to the cart from the product cards.
   - Remove items from the cart.
   - Increase or decrease quantity directly.
4. UI should display Product Image, Name, Quantity selector, Price, Remove button, and dynamically calculated cart totals.
```

### 🔍 Audit Checks:
- [x] Add an item to the cart and verify it stores correctly in the `cart_items` table mapped to the user ID.
- [x] Navigate to `/cart` and check if the total price correctly reflects the items and their quantities.
- [x] Refresh the page and ensure the cart data persists and refetches successfully.

---

## Module 7: Order System

### 📋 Prompt to AI:
```text
Cart works. Please execute **Module 7**:
Implement the order checkout system.
Workflow: User → Cart → Checkout → Order created.
1. When "checkout" is clicked on the cart page:
   - Create a record in `orders`.
   - Create related entries in `order_items`.
   - Clear the user's current `cart_items` from the database.
2. Redirect the user to `/orders`.
3. Create the `/orders` page to show: Order ID, Order date, Order status, Total price.
4. Allow users to view detailed order information.
```

### 🔍 Audit Checks:
- [ ] Execute a checkout and verify the orders and order_items tables are populated correctly.
- [ ] Verify the cart becomes totally empty after checking out.
- [ ] Ensure the `orders` page lists the order and status accurately.

---

## Module 8: UI Design System

### 📋 Prompt to AI:
```text
Business logic holds up. Please execute **Module 8**:
Refine all the UI design system heavily using Shadcn UI along with Stitch MCP.
Ensure the layout is modern and responsive (similar to top-tier ecommerce apps).
1. Validate implementation of Shadcn components: Card, Button, Input, Dialog, Sheet, Toast, Dropdown Menu, Badge.
2. Extract the following into reusable standalone components if they aren't already:
   - ProductCard
   - Navbar
   - CategoryFilter
   - CartButton (with ping/badge for items inside)
   - OrderCard
```

### 🔍 Audit Checks:
- [ ] Click through the application and ensure the UI feels unified and spacing is consistent.
- [ ] Verify the reusable components are located in the `/components` folder and exported cleanly.
- [ ] Simulate actions (like adding to cart) and ensure feedback elements (like Toasts) appear appropriately.

---

## Module 9: Stitch MCP Integration

### 📋 Prompt to AI:
```text
Refinement complete. Please execute **Module 9**:
Integrate the Stitch MCP server to assist with UI generation and component composition within the app.
Provide any developer scripts to generate components via Stitch MCP, ensuring it respects the Next.js App Router, Tailwind, and Shadcn configuration.
```

### 🔍 Audit Checks:
- [ ] Verify that UI generation using the MCP connection works correctly.
- [ ] Run the generated scripts to create a dummy component via the Stitch MCP and ensure it mounts gracefully.

---

## Module 10: Future Enhancements Prep

### 📋 Prompt to AI:
```text
Final stage! Please execute **Module 10**:
Review the entire architecture to ensure we are ready for these future features:
- Payment integration (Razorpay)
- Admin dashboard (CRUD operations for products and orders)
- Product reviews, Wishlist, Coupons, and Inventory tracking

Provide a brief architectural write-up or file placeholder outline for how these extensions will be implemented into the current structure.
```

### 🔍 Audit Checks:
- [x] Review the architecture outline—does the routing and db schema natively support scaling for Razorpay/Dashboards?
- [x] Walk through the codebase one final time to evaluate clean file boundaries and modularity.
