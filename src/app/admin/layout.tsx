import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";

/** Server-side role check (the proxy also blocks non-admins). */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/admin");
  if (user.role !== "admin") redirect("/");
  return <>{children}</>;
}
