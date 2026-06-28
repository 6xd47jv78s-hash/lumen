// Is real Clerk auth configured? We treat Clerk as "enabled" only when a real
// publishable key is present (starts with "pk_") and is not the .env.example
// placeholder. This lets the app boot and run fully in dev with NO Clerk keys,
// and switch to real auth automatically the moment valid keys are provided.
export const clerkEnabled =
  typeof process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === "string" &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_") &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("REPLACE_ME");
