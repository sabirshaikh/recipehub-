import RecipeCard from "@/components/recipe/RecipeCard";
import type { RecipeSummary } from "@/types/recipe";

interface RecipeGridProps {
  recipes: RecipeSummary[];
  /** How many leading cards to eager-load (above the fold). */
  priorityCount?: number;
  emptyMessage?: string;
}

export default function RecipeGrid({
  recipes,
  priorityCount = 0,
  emptyMessage = "No recipes found.",
}: RecipeGridProps) {
  if (recipes.length === 0) {
    return (
      <div className="rounded-brand-lg border border-dashed border-border p-12 text-center">
        <p className="text-4xl" aria-hidden>
          🍳
        </p>
        <p className="mt-3 text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {recipes.map((recipe, index) => (
        <RecipeCard key={recipe.id} recipe={recipe} priority={index < priorityCount} />
      ))}
    </div>
  );
}
