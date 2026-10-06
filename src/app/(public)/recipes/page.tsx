import type { Metadata } from "next";
import CategoryChips from "@/components/recipe/CategoryChips";
import HeroSearch from "@/components/recipe/HeroSearch";
import RecipeGrid from "@/components/recipe/RecipeGrid";
import { CATEGORY_LABELS } from "@/lib/constants";
import { isCategory, listPublishedRecipes } from "@/lib/recipes";

export const metadata: Metadata = {
  title: "Browse recipes",
  description: "Browse and search recipes from cuisines around the world.",
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

// Interim listing (text search + category). Phase 4 replaces this with the full
// filter/sort/pagination UI synced to the URL.
export default async function RecipesPage({ searchParams }: PageProps<"/recipes">) {
  const params = await searchParams;
  const q = first(params.q)?.trim() ?? "";
  const category = first(params.category);
  const activeCategory = isCategory(category) ? category : undefined;

  const recipes = await listPublishedRecipes({ q, category: activeCategory, limit: 60 });

  const heading = q
    ? `Results for “${q}”`
    : activeCategory
      ? `${CATEGORY_LABELS[activeCategory]} recipes`
      : "All recipes";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 space-y-5 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>
        <HeroSearch defaultValue={q} />
        <CategoryChips active={activeCategory} />
      </div>
      <p className="mb-4 text-sm text-muted" aria-live="polite">
        {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
      </p>
      <RecipeGrid
        recipes={recipes}
        priorityCount={4}
        emptyMessage={
          q ? "No recipes match your search. Try another word." : "No recipes here yet."
        }
      />
    </div>
  );
}
