import "server-only";
import NextAuth, { CredentialsSignin, type User as AuthUser } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { authConfig } from "@/lib/auth.config";
import { connectDB } from "@/lib/db";
import { authLimiter, getClientIp } from "@/lib/rate-limit";
import { loginSchema } from "@/schemas/auth";
import { User, type UserDocument } from "@/models/User";

class InvalidCredentialsError extends CredentialsSignin {
  code = "invalid_credentials";
}
class RateLimitedError extends CredentialsSignin {
  code = "rate_limited";
}

// Real bcrypt hash of a random value, created once — used when no user matches
let dummyHash: string | undefined;
function getDummyHash() {
  dummyHash ??= bcrypt.hashSync(crypto.randomUUID(), 12);
  return dummyHash;
}

export const isGoogleEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);

function toAuthUser(user: UserDocument): AuthUser {
  return {
    id: user.id as string,
    name: user.name,
    email: user.email,
    image: user.avatar || null,
    username: user.username,
    role: user.role,
  };
}

/** "Jane.Doe+food@x.com" → "jane_doe_food", made unique with a numeric suffix. */
async function generateUniqueUsername(email: string) {
  const base =
    email
      .split("@")[0]!
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .slice(0, 24)
      .replace(/^_+|_+$/g, "") || "cook";
  let candidate = base.length >= 3 ? base : `${base}_cook`;
  while (await User.exists({ username: candidate })) {
    candidate = `${base}_${Math.floor(1000 + Math.random() * 9000)}`;
  }
  return candidate;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  logger: {
    // Wrong passwords / rate limits are expected — don't log them as server errors
    error(error) {
      if (error instanceof CredentialsSignin) return;
      console.error("[auth]", error);
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { type: "email", label: "Email" },
        password: { type: "password", label: "Password" },
      },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) throw new InvalidCredentialsError();
        const { email, password } = parsed.data;

        const ip = getClientIp(request.headers);
        if (!authLimiter(`login:${ip}:${email}`).ok) throw new RateLimitedError();

        await connectDB();
        const user = await User.findOne({ email }).select("+passwordHash");
        // Compare even when the user is missing/OAuth-only to keep timing uniform
        const hash = user?.passwordHash ?? getDummyHash();
        const valid = await bcrypt.compare(password, hash);
        if (!user || !user.passwordHash || !valid) throw new InvalidCredentialsError();

        return toAuthUser(user);
      },
    }),
    ...(isGoogleEnabled ? [Google] : []),
  ],
  callbacks: {
    ...authConfig.callbacks,

    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;
      // Only trust Google accounts with a verified email
      if (!profile?.email || profile.email_verified !== true) return false;

      await connectDB();
      const email = profile.email.toLowerCase();
      const existing = await User.findOne({ email });
      if (!existing) {
        await User.create({
          name: profile.name ?? email.split("@")[0],
          email,
          username: await generateUniqueUsername(email),
          avatar: typeof profile.picture === "string" ? profile.picture : "",
        });
      }
      return true;
    },

    async jwt(params) {
      // For OAuth, `user.id` is the provider's id — swap in our DB user.
      if (params.account?.provider === "google" && params.user?.email) {
        await connectDB();
        const dbUser = await User.findOne({ email: params.user.email.toLowerCase() });
        if (dbUser) params.user = toAuthUser(dbUser);
      }
      return authConfig.callbacks.jwt(params);
    },
  },
});
