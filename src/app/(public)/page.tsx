import Link from "next/link";
import { connection } from "next/server";
import CategoryChips from "@/components/recipe/CategoryChips";
import HeroSearch from "@/components/recipe/HeroSearch";
import RecipeGrid from "@/components/recipe/RecipeGrid";
import { listPublishedRecipes } from "@/lib/recipes";

// Interim home page with live data. Phase 4 adds featured/trending sections
// with React Query hydration.
export default async function HomePage() {
  await connection(); // render per request (reads from MongoDB)
  const latest = await listPublishedRecipes({ limit: 8 });

  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-background px-4 py-14 text-center sm:px-6 sm:py-20 dark:from-brand-900/20">
        <p className="mb-3 text-sm font-semibold tracking-widest text-brand uppercase">
          Cook with what you have
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
          Find your next favorite recipe
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
          Search by dish, cuisine or the ingredients already in your kitchen.
        </p>
        <div className="mt-8">
          <HeroSearch />
        </div>
        <div className="mt-6">
          <CategoryChips />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6" aria-labelledby="latest">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 id="latest" className="text-2xl font-bold tracking-tight">
            Latest recipes
          </h2>
          <Link href="/recipes" className="text-sm font-semibold text-brand hover:underline">
            View all →
          </Link>
        </div>
        <RecipeGrid
          recipes={latest}
          priorityCount={4}
          emptyMessage="No recipes yet. Run `pnpm seed` to add demo recipes."
        />
      </section>
    </>
  );
}
