import { clerkMiddleware } from "@clerk/nextjs/server";

// Enables Clerk auth on every request so `auth()`/`currentUser()` work in
// route handlers and server components. Routes stay public by default; the
// API routes do their own getUser() check and return 401 when not signed in.
export default clerkMiddleware();

export const config = {
  matcher: [
    // run on everything except Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|gif|png|svg|ico|webp|woff2?|ttf)).*)",
    // always run on API routes
    "/(api|trpc)(.*)",
  ],
};
