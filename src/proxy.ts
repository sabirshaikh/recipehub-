import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Next 16 "proxy" (formerly middleware). Route rules live in
 * `authConfig.callbacks.authorized`; this only reads the JWT cookie (no DB).
 */
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/saved/:path*",
    "/recipes/new",
    "/recipes/:slug/edit",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
