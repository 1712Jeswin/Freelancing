"use server";

import { db } from "@/db";
import { addresses, users } from "@/db/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq, desc } from "drizzle-orm";

import { getInternalUserId } from "@/lib/auth";

export async function getUserAddresses() {
  try {
    const userId = await getInternalUserId();
    if (!userId) return [];

    const userAddresses = await db
      .select()
      .from(addresses)
      .where(eq(addresses.user_id, userId))
      .orderBy(desc(addresses.is_default)); // Default address first

    return userAddresses;
  } catch (error) {
    console.error("Failed to fetch addresses:", error);
    return [];
  }
}

export type AddressInsertData = {
  recipient_name: string;
  phone_number: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default?: boolean;
};

export async function addAddress(data: AddressInsertData) {
  try {
    const userId = await getInternalUserId();
    if (!userId) throw new Error("Unauthorized");

    // If this is set as default, we should optimally unset others, but for simplicity
    // we will just insert it. A full implementation would run a transaction here.
    if (data.is_default) {
       await db.update(addresses)
         .set({ is_default: false })
         .where(eq(addresses.user_id, userId));
    }

    const [newAddress] = await db.insert(addresses).values({
      user_id: userId,
      recipient_name: data.recipient_name,
      phone_number: data.phone_number,
      street_address: data.street_address,
      city: data.city,
      state: data.state,
      postal_code: data.postal_code,
      country: data.country,
      is_default: data.is_default || false,
    }).returning();

    return { success: true, address: newAddress };
  } catch (error: any) {
    console.error("Failed to add address:", error);
    return { success: false, error: error.message || "Failed to add address" };
  }
}

export async function updateAddress(addressId: string, data: Partial<AddressInsertData>) {
  try {
    const userId = await getInternalUserId();
    if (!userId) throw new Error("Unauthorized");

    // Check ownership
    const [existing] = await db.select().from(addresses).where(eq(addresses.id, addressId));
    if (!existing || existing.user_id !== userId) throw new Error("Address not found or unauthorized");

    if (data.is_default) {
      await db.update(addresses)
        .set({ is_default: false })
        .where(eq(addresses.user_id, userId));
    }

    const [updated] = await db.update(addresses)
      .set({
        ...data,
      })
      .where(eq(addresses.id, addressId))
      .returning();

    return { success: true, address: updated };
  } catch (error: any) {
    console.error("Failed to update address:", error);
    return { success: false, error: error.message || "Failed to update address" };
  }
}

export async function deleteAddress(addressId: string) {
  try {
    const userId = await getInternalUserId();
    if (!userId) throw new Error("Unauthorized");

    // Check ownership
    const [existing] = await db.select().from(addresses).where(eq(addresses.id, addressId));
    if (!existing || existing.user_id !== userId) throw new Error("Address not found or unauthorized");

    await db.delete(addresses).where(eq(addresses.id, addressId));

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete address:", error);
    return { success: false, error: error.message || "Failed to delete address" };
  }
}
