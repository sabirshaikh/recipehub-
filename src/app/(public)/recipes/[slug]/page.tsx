import { cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import RecipeGrid from "@/components/recipe/RecipeGrid";
import { ClockIcon, DifficultyBadge, UsersIcon } from "@/components/recipe/RecipeMeta";
import { CATEGORY_LABELS, DIET_LABELS } from "@/lib/constants";
import { getPublishedRecipeBySlug, getRelatedRecipes } from "@/lib/recipes";
import { formatMinutes, formatQuantity } from "@/lib/utils";
import type { RecipeDetail } from "@/types/recipe";

// Dedupe the DB query between generateMetadata and the page
const getRecipe = cache(getPublishedRecipeBySlug);

export async function generateMetadata({
  params,
}: PageProps<"/recipes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipe(slug);
  if (!recipe) return { title: "Recipe not found" };

  return {
    title: recipe.title,
    description: recipe.description,
    alternates: { canonical: `/recipes/${recipe.slug}` },
    openGraph: {
      type: "article",
      title: recipe.title,
      description: recipe.description,
      images: recipe.coverImage ? [{ url: recipe.coverImage, alt: recipe.title }] : undefined,
      publishedTime: recipe.createdAt,
      authors: [recipe.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title: recipe.title,
      description: recipe.description,
      images: recipe.coverImage ? [recipe.coverImage] : undefined,
    },
  };
}

/** schema.org/Recipe structured data for rich search results. */
function recipeJsonLd(recipe: RecipeDetail) {
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.description,
    image: recipe.coverImage ? [recipe.coverImage] : undefined,
    author: { "@type": "Person", name: recipe.author.name },
    datePublished: recipe.createdAt,
    prepTime: `PT${recipe.prepTime}M`,
    cookTime: `PT${recipe.cookTime}M`,
    totalTime: `PT${recipe.totalTime}M`,
    recipeYield: `${recipe.servings} servings`,
    recipeCategory: CATEGORY_LABELS[recipe.category],
    recipeCuisine: recipe.cuisine,
    keywords: recipe.tags.join(", "),
    recipeIngredient: recipe.ingredients.map((ing) =>
      [formatQuantity(ing.quantity), ing.unit, ing.name].filter(Boolean).join(" "),
    ),
    recipeInstructions: recipe.steps.map((s) => ({ "@type": "HowToStep", text: s.text })),
    ...(recipe.ratingsCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: recipe.averageRating,
        ratingCount: recipe.ratingsCount,
      },
    }),
  };
}

export default async function RecipeDetailPage({ params }: PageProps<"/recipes/[slug]">) {
  const { slug } = await params;
  const recipe = await getRecipe(slug);
  if (!recipe) notFound();

  const related = await getRelatedRecipes(recipe);
  const stats = [
    { label: "Prep", value: formatMinutes(recipe.prepTime) },
    { label: "Cook", value: recipe.cookTime ? formatMinutes(recipe.cookTime) : "No cook" },
    { label: "Total", value: formatMinutes(recipe.totalTime) },
    { label: "Servings", value: String(recipe.servings) },
  ];

  return (
    <article className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <script
        type="application/ld+json"
        // JSON.stringify output with "<" escaped is safe to inline
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(recipeJsonLd(recipe)).replace(/</g, "\\u003c"),
        }}
      />

      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-brand">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href={`/recipes?category=${recipe.category}`} className="hover:text-brand">
              {CATEGORY_LABELS[recipe.category]}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="truncate text-foreground">
            {recipe.title}
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div className="relative aspect-[4/3] overflow-hidden rounded-brand-lg bg-brand-50 shadow-sm dark:bg-white/5">
          {recipe.coverImage && (
            <Image
              src={recipe.coverImage}
              alt={recipe.title}
              fill
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
            />
          )}
        </div>

        <header>
          <p className="text-sm font-semibold tracking-wide text-brand uppercase">
            {recipe.cuisine} · {CATEGORY_LABELS[recipe.category]}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {recipe.title}
          </h1>
          <p className="mt-2 text-sm text-muted">
            By <span className="font-semibold text-foreground">{recipe.author.name}</span>
            {recipe.author.username && <> · @{recipe.author.username}</>}
          </p>
          <p className="mt-4 text-lg leading-relaxed text-muted">{recipe.description}</p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <DifficultyBadge difficulty={recipe.difficulty} />
            {recipe.dietTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-800 dark:bg-brand-900/30 dark:text-brand-200"
              >
                {DIET_LABELS[tag]}
              </span>
            ))}
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-brand border border-border bg-surface p-3 text-center"
              >
                <dt className="flex items-center justify-center gap-1 text-xs font-medium text-muted uppercase">
                  {s.label === "Servings" ? (
                    <UsersIcon className="size-3.5" />
                  ) : (
                    <ClockIcon className="size-3.5" />
                  )}
                  {s.label}
                </dt>
                <dd className="mt-1 font-bold">{s.value}</dd>
              </div>
            ))}
          </dl>
        </header>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <section aria-labelledby="ingredients">
          <h2 id="ingredients" className="text-2xl font-bold tracking-tight">
            Ingredients
          </h2>
          <p className="mt-1 text-sm text-muted">For {recipe.servings} servings</p>
          <ul className="mt-4 divide-y divide-border rounded-brand-lg border border-border bg-surface">
            {recipe.ingredients.map((ing, index) => (
              <li key={`${ing.name}-${index}`} className="flex gap-3 px-4 py-3">
                <span className="min-w-16 font-semibold text-brand-700 dark:text-brand-300">
                  {[formatQuantity(ing.quantity), ing.unit].filter(Boolean).join(" ") || "—"}
                </span>
                <span className="capitalize">{ing.name}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="method">
          <h2 id="method" className="text-2xl font-bold tracking-tight">
            Method
          </h2>
          <ol className="mt-4 space-y-4">
            {recipe.steps.map((step) => (
              <li key={step.order} className="flex gap-4">
                <span
                  aria-hidden
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-white"
                >
                  {step.order}
                </span>
                <p className="pt-1 leading-relaxed">
                  <span className="sr-only">Step {step.order}: </span>
                  {step.text}
                </p>
              </li>
            ))}
          </ol>

          {recipe.tags.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Tags">
              {recipe.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={`/recipes?q=${encodeURIComponent(tag)}`}
                    className="rounded-full border border-border px-3 py-1 text-sm text-muted hover:border-brand hover:text-brand"
                  >
                    #{tag}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {related.length > 0 && (
        <section className="mt-16" aria-labelledby="related">
          <h2 id="related" className="mb-6 text-2xl font-bold tracking-tight">
            You might also like
          </h2>
          <RecipeGrid recipes={related} />
        </section>
      )}
    </article>
  );
}
