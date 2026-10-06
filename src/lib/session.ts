import "server-only";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { ApiError } from "@/lib/api-error";

export type SessionUser = Session["user"];

/** Current user or null. Use in Server Components / Route Handlers. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  return session?.user?.id ? session.user : null;
}

/** Throws ApiError(401) when signed out — for Route Handlers. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new ApiError("You need to log in to do that.", 401, { code: "UNAUTHORIZED" });
  return user;
}

/** Throws ApiError(401/403) unless the user is an admin. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin") {
    throw new ApiError("You don't have permission to do that.", 403, { code: "FORBIDDEN" });
  }
  return user;
}

/** Owner-or-admin check used for recipe/review mutations. */
export function canModify(user: SessionUser, ownerId: string) {
  return user.role === "admin" || user.id === ownerId;
}
