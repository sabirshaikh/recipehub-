import type { NextAuthConfig } from "next-auth";

/** Paths that require a signed-in user. `/recipes/[slug]/edit` is matched separately. */
const PROTECTED_PREFIXES = ["/dashboard", "/saved", "/recipes/new", "/admin"];
const AUTH_PAGES = ["/login", "/register"];

function isProtected(pathname: string) {
  return (
    PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    /^\/recipes\/[^/]+\/edit\/?$/.test(pathname)
  );
}

/**
 * Database-free Auth.js config, shared by `src/proxy.ts` and `src/lib/auth.ts`.
 * Keep it free of Mongoose/bcrypt imports so the proxy stays lightweight.
 */
export const authConfig = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login", error: "/login" },
  providers: [], // Added in src/lib/auth.ts
  callbacks: {
    /** Route protection used by the proxy. Returning false redirects to /login. */
    authorized({ auth, request: { nextUrl } }) {
      const user = auth?.user;
      const { pathname } = nextUrl;

      if (AUTH_PAGES.includes(pathname)) {
        return user ? Response.redirect(new URL("/dashboard", nextUrl)) : true;
      }
      if (pathname === "/admin" || pathname.startsWith("/admin/")) {
        if (!user) return false;
        return user.role === "admin" ? true : Response.redirect(new URL("/", nextUrl));
      }
      if (isProtected(pathname)) return Boolean(user);
      return true;
    },

    /** Runs on sign-in and on every session read; must stay DB-free here. */
    jwt({ token, user, trigger, session }) {
      if (user) {
        if (user.id) token.id = user.id;
        token.username = user.username;
        token.role = user.role ?? "user";
      }
      // Client called `useSession().update({ name, image })` after a profile edit
      if (trigger === "update" && session && typeof session === "object") {
        const data = session as { name?: unknown; image?: unknown };
        if (typeof data.name === "string") token.name = data.name;
        if (typeof data.image === "string") token.picture = data.image;
      }
      return token;
    },

    session({ session, token }) {
      if (typeof token.id === "string") session.user.id = token.id;
      session.user.username = typeof token.username === "string" ? token.username : "";
      session.user.role = token.role === "admin" ? "admin" : "user";
      return session;
    },
  },
} satisfies NextAuthConfig;
