import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import { isDashboardTab } from "@/components/dashboard/tabs";
import MyRecipesTable from "@/components/dashboard/MyRecipesTable";
import { listRecipesByAuthor } from "@/lib/recipes";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

// Server-rendered for now; Phase 5 moves this onto React Query with mutations
// (edit/delete, saved recipes, profile settings).
export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/dashboard");

  const { tab } = await searchParams;
  const activeTab = isDashboardTab(tab) ? tab : "recipes";
  const recipes = await listRecipesByAuthor(user.id);

  const published = recipes.filter((r) => r.status === "published").length;
  const stats = [
    { label: "Total recipes", value: recipes.length },
    { label: "Published", value: published },
    { label: "Drafts", value: recipes.length - published },
    { label: "Ratings received", value: recipes.reduce((sum, r) => sum + r.ratingsCount, 0) },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Hi, {user.name?.split(" ")[0]} 👋</h1>
      <p className="mt-2 text-muted">
        Signed in as <span className="font-medium text-foreground">@{user.username}</span>
      </p>

      <dl className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-brand-lg border border-border bg-surface p-4 shadow-sm"
          >
            <dt className="text-sm text-muted">{s.label}</dt>
            <dd className="mt-1 text-2xl font-bold">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 rounded-brand-lg border border-border bg-surface p-4 shadow-sm sm:p-6">
        <DashboardTabs
          activeTab={activeTab}
          recipesCount={recipes.length}
          recipesPanel={<MyRecipesTable recipes={recipes} />}
        />
      </div>
    </div>
  );
}
