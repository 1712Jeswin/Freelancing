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
  try {
    const { userId: clerkId } = await auth();
    if (clerkId) {
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
      }
    }
  } catch (error) {
    console.error("[Auth] auth() threw an error, trying guest logic.", error);
  }

  // Fallback: Anonymous User (Guest checkout mode)
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    let guestId = cookieStore.get("guest_id")?.value;

    if (!guestId) {
      guestId = "guest_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      try {
        cookieStore.set("guest_id", guestId, { 
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production"
        });
      } catch (err) {
        // May fail if called during a layout rendering, but will succeed in Server Action.
        console.warn("Could not set guest_id cookie, probably in SSR mode");
      }
    }

    let [user] = await db.select().from(users).where(eq(users.clerk_id, guestId));
    if (user) return user.id;

    const [newUser] = await db.insert(users).values({
      clerk_id: guestId,
      email: `${guestId}@guest.local`,
      name: "Guest",
    }).returning();
    
    return newUser.id;
  } catch (error) {
    console.error("[Auth] Failed to initiate guest session", error);
    return null;
  }
}
