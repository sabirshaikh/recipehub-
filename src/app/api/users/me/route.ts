import { connectDB } from "@/lib/db";
import { fail, handleRouteError, ok } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { User } from "@/models/User";
import type { PublicUser } from "@/types/user";

/** GET /api/users/me — the signed-in user's profile. (PATCH arrives in Phase 5.) */
export async function GET() {
  try {
    const sessionUser = await requireUser();
    await connectDB();
    const user = await User.findById(sessionUser.id);
    if (!user) return fail(404, "User not found", { code: "NOT_FOUND" });
    return ok(user.toJSON() as unknown as PublicUser);
  } catch (error) {
    return handleRouteError(error);
  }
}
