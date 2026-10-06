import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { fail, ok } from "@/lib/api-response";

export const dynamic = "force-dynamic";

/** GET /api/health — verifies the app can reach MongoDB. */
export async function GET() {
  try {
    await connectDB();
    return ok({
      status: "ok",
      db: mongoose.connection.readyState === 1 ? "connected" : "connecting",
    });
  } catch (error) {
    console.error("[health] database connection failed", error);
    return fail(503, "Database unavailable", { code: "DB_UNAVAILABLE" });
  }
}
