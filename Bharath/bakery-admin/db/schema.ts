import { pgTable, uuid, text, timestamp, integer, numeric, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerk_id: text("clerk_id").notNull(),
  email: text("email").notNull(),
  name: text("name"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(), // 1kg base price
  price_quarter: numeric("price_quarter", { precision: 10, scale: 2 }),
  price_half: numeric("price_half", { precision: 10, scale: 2 }),
  price_one_half: numeric("price_one_half", { precision: 10, scale: 2 }),
  price_two: numeric("price_two", { precision: 10, scale: 2 }),
  image_url: text("image_url"),
  category_id: uuid("category_id").references(() => categories.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const cart_items = pgTable("cart_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id).notNull(),
  product_id: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  weight: text("weight").notNull().default("1kg"),
});

export const addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id).notNull(),
  recipient_name: text("recipient_name").notNull(),
  phone_number: text("phone_number").notNull().default(""),
  street_address: text("street_address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postal_code: text("postal_code").notNull(),
  country: text("country").notNull(),
  is_default: boolean("is_default").default(false),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id).notNull(),
  shipping_address: text("shipping_address"), // Text snapshot of the address
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax_amount: numeric("tax_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  shipping_cost: numeric("shipping_cost", { precision: 10, scale: 2 }).notNull().default("0"),
  total_price: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  razorpay_order_id: text("razorpay_order_id"),
  razorpay_payment_id: text("razorpay_payment_id"),
  payment_status: text("payment_status").notNull().default("pending"),
  payment_method: text("payment_method").notNull().default("razorpay"),
  cancellation_reason: text("cancellation_reason"),
  cancellation_details: text("cancellation_details"),
  delivery_date: timestamp("delivery_date"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const order_items = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  order_id: uuid("order_id").references(() => orders.id).notNull(),
  product_id: uuid("product_id").references(() => products.id, { onDelete: "set null" }), // allows product deletion
  quantity: integer("quantity").notNull().default(1),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  weight: text("weight").notNull().default("1kg"),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id).notNull(),
  product_id: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  rating: integer("rating").notNull(), // 1 to 5
  comment: text("comment"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

