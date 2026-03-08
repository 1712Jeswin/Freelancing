export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL,

  // Clerk settings for Auth
  clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  clerkSecretKey: process.env.CLERK_SECRET_KEY,
};
