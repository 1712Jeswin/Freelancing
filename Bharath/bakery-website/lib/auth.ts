"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

/**
 * Gets the internal UUID for the currently authenticated User.
 * Lazy-syncs with Clerk if the user record doesn't exist yet.
 */
export async function getInternalUserId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    console.log("[Auth] No clerkId found in auth()");
    return null;
  }

  // 1. Check if user exists
  const [user] = await db.select().from(users).where(eq(users.clerk_id, clerkId));
  if (user) {
    return user.id;
  }

  // 2. Lazy sync from Clerk
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      console.log("[Auth] No clerkUser found in currentUser()");
      return null;
    }

    const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress || "";
    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || primaryEmail.split('@')[0];

    const [newUser] = await db.insert(users).values({
      clerk_id: clerkId,
      email: primaryEmail,
      name: name,
    }).returning();

    console.log("[Auth] Lazy-synced new user:", newUser.id);
    return newUser.id;
  } catch (error) {
    console.error("[Auth] Failed to lazy-sync user:", error);
    return null;
  }
}
