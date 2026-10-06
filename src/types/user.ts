import type { UserRole } from "@/models/User";

/** User as returned by the API (never includes passwordHash). */
export interface PublicUser {
  id: string;
  name: string;
  username: string;
  email?: string;
  avatar: string;
  bio: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}
