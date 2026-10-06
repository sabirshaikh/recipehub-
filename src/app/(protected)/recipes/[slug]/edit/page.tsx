import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import RecipeForm from "@/components/forms/RecipeForm";
import { getRecipeBySlug } from "@/lib/recipes";
import { canModify, getSessionUser } from "@/lib/session";
import { getUploadMode } from "@/lib/uploads";

export const metadata: Metadata = { title: "Edit recipe", robots: { index: false } };

export default async function EditRecipePage({ params }: PageProps<"/recipes/[slug]/edit">) {
  const { slug } = await params;
  const user = await getSessionUser();
  if (!user) redirect(`/login?callbackUrl=/recipes/${encodeURIComponent(slug)}/edit`);

  const recipe = await getRecipeBySlug(slug);
  // 404 (not 403) for other people's recipes so drafts aren't discoverable
  if (!recipe || !canModify(user, recipe.author.id)) notFound();

  const isDraft = recipe.status === "draft";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="text-sm text-muted">
          <Link href="/dashboard?tab=recipes" className="hover:text-brand">
            ← My recipes
          </Link>
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          {isDraft ? "Edit draft" : "Edit recipe"}
        </h1>
        <p className="mt-2 text-muted">
          {isDraft ? (
            <>
              This draft is only visible to you.{" "}
              <Link
                href={`/recipes/${recipe.slug}`}
                className="font-medium text-brand hover:underline"
              >
                Preview it
              </Link>{" "}
              or publish it when it&apos;s ready.
            </>
          ) : (
            <>
              Changes go live as soon as you save.{" "}
              <Link
                href={`/recipes/${recipe.slug}`}
                className="font-medium text-brand hover:underline"
              >
                View recipe
              </Link>
            </>
          )}
        </p>
      </header>
      <RecipeForm recipe={recipe} uploadMode={getUploadMode()} />
    </div>
  );
}
