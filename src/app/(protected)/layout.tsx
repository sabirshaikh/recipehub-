import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";

/**
 * Defense in depth: `src/proxy.ts` already redirects signed-out users,
 * but every protected page re-checks the session on the server too.
 */
export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return <>{children}</>;
}
