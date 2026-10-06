import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { fail, handleRouteError, ok } from "@/lib/api-response";
import { authLimiter, getClientIp } from "@/lib/rate-limit";
import { registerSchema } from "@/schemas/auth";
import { User } from "@/models/User";
import type { PublicUser } from "@/types/user";

const BCRYPT_ROUNDS = 12;

function isDuplicateKeyError(error: unknown): error is { code: 11000; keyPattern?: object } {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

/** POST /api/auth/register — create an account with email + password. */
export async function POST(request: NextRequest) {
  try {
    const limit = authLimiter(`register:${getClientIp(request.headers)}`);
    if (!limit.ok) {
      return fail(429, "Too many sign-up attempts. Please try again later.", {
        code: "RATE_LIMITED",
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      });
    }

    const input = registerSchema.parse(await request.json().catch(() => ({})));
    await connectDB();

    const [emailTaken, usernameTaken] = await Promise.all([
      User.exists({ email: input.email }),
      User.exists({ username: input.username }),
    ]);
    if (emailTaken || usernameTaken) {
      return fail(409, "An account with those details already exists.", {
        code: "CONFLICT",
        fieldErrors: {
          ...(emailTaken && { email: ["This email is already registered"] }),
          ...(usernameTaken && { username: ["This username is taken"] }),
        },
      });
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const user = await User.create({
      name: input.name,
      username: input.username,
      email: input.email,
      passwordHash,
    });

    return ok(user.toJSON() as unknown as PublicUser, { status: 201 });
  } catch (error) {
    // Race: another request registered the same email/username in between
    if (isDuplicateKeyError(error)) {
      const field = Object.keys(error.keyPattern ?? {})[0] ?? "email";
      return fail(409, "An account with those details already exists.", {
        code: "CONFLICT",
        fieldErrors: { [field]: [`This ${field} is already in use`] },
      });
    }
    return handleRouteError(error);
  }
}
