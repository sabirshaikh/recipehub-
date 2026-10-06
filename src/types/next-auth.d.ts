import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/models/User";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    username?: string;
    role?: UserRole;
  }
}

// JWT extends Record<string, unknown>; its custom fields are narrowed in auth.config.ts
