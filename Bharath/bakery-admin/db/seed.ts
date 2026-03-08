import { db } from "./index";
import { categories, products } from "./schema";

async function main() {
  console.log("Starting database seed...");

  try {
    // Check if categories already exist
    const existingCats = await db.select().from(categories).limit(1);
    
    if (existingCats.length > 0) {
      console.log("Database already has categories. Skipping seed.");
      process.exit(0);
    }

    // Insert categories
    const insertedCategories = await db.insert(categories).values([
      { name: "Cakes", slug: "cakes" },
      { name: "Desserts", slug: "desserts" },
      { name: "Brownies", slug: "brownies" },
      { name: "Juices", slug: "juices" },
    ]).returning();
    
    console.log("Categories seeded!");

    const cakes = insertedCategories.find(c => c.slug === "cakes")?.id;
    const desserts = insertedCategories.find(c => c.slug === "desserts")?.id;
    const brownies = insertedCategories.find(c => c.slug === "brownies")?.id;
    const juices = insertedCategories.find(c => c.slug === "juices")?.id;

    // Insert products
    await db.insert(products).values([
      {
        name: "Classic Chocolate Cake",
        description: "A rich, moist chocolate cake with fudgy frosting.",
        price: "35.00",
        image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80",
        category_id: cakes,
      },
      {
        name: "Vanilla Bean Cheesecake",
        description: "Creamy cheesecake with real vanilla bean spec.",
        price: "40.00",
        image_url: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&q=80",
        category_id: cakes,
      },
      {
        name: "Strawberry Tart",
        description: "Fresh strawberries on a sweet pastry crust.",
        price: "6.50",
        image_url: "https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=500&q=80",
        category_id: desserts,
      },
      {
        name: "Fudge Brownie",
        description: "Gooey chocolate brownie with chocolate chips.",
        price: "4.50",
        image_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80",
        category_id: brownies,
      },
      {
        name: "Fresh Orange Juice",
        description: "Freshly squeezed oranges, 100% natural.",
        price: "5.00",
        image_url: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&q=80",
        category_id: juices,
      },
      {
        name: "Lemon Raspberry Cake",
        description: "Zesty lemon cake with fresh raspberry filling.",
        price: "38.00",
        image_url: "https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=500&q=80",
        category_id: cakes,
      }
    ]);

    console.log("Products seeded completely!");
    process.exit(0);

  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

main();
