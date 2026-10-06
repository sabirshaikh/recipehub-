import Image from "next/image";
import Link from "next/link";
import { CATEGORY_LABELS, DIET_LABELS } from "@/lib/constants";
import { formatMinutes } from "@/lib/utils";
import { ClockIcon, DifficultyBadge, StarIcon } from "@/components/recipe/RecipeMeta";
import type { RecipeSummary } from "@/types/recipe";

interface RecipeCardProps {
  recipe: RecipeSummary;
  /** Eager-load images for above-the-fold cards. */
  priority?: boolean;
}

export default function RecipeCard({ recipe, priority = false }: RecipeCardProps) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-brand-lg border border-border bg-surface shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-50 dark:bg-white/5">
        {recipe.coverImage ? (
          <Image
            src={recipe.coverImage}
            alt={recipe.title}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-4xl" aria-hidden>
            🍲
          </div>
        )}
        <span className="absolute top-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
          {CATEGORY_LABELS[recipe.category]}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-semibold tracking-wide text-brand uppercase">{recipe.cuisine}</p>
        <h3 className="line-clamp-2 text-lg leading-snug font-bold">
          {/* Stretched link: whole card is clickable, one focusable element */}
          <Link
            href={`/recipes/${recipe.slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-none after:focus-visible:rounded-brand-lg after:focus-visible:ring-2 after:focus-visible:ring-brand"
          >
            {recipe.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-muted">{recipe.description}</p>

        {recipe.dietTags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Diet">
            {recipe.dietTags.slice(0, 3).map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-800 dark:bg-brand-900/30 dark:text-brand-200"
              >
                {DIET_LABELS[tag]}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-sm text-muted">
          <span className="inline-flex items-center gap-1">
            <ClockIcon />
            <span>{formatMinutes(recipe.totalTime)}</span>
          </span>
          {recipe.ratingsCount > 0 ? (
            <span className="inline-flex items-center gap-1">
              <StarIcon className="text-amber-400" />
              <span>
                {recipe.averageRating.toFixed(1)} <span className="sr-only">out of 5 from</span>(
                {recipe.ratingsCount})
              </span>
            </span>
          ) : null}
          <DifficultyBadge difficulty={recipe.difficulty} />
        </div>
      </div>
    </article>
  );
}
