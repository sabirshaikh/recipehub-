import { isValidObjectId } from "mongoose";
import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { fail, handleRouteError, ok } from "@/lib/api-response";
import { ApiError } from "@/lib/api-error";
import { generateUniqueSlug, getRecipeById, getRecipeBySlug } from "@/lib/recipes";
import { canModify, getSessionUser, requireUser } from "@/lib/session";
import { Recipe } from "@/models/Recipe";
import { recipeInputSchema } from "@/schemas/recipe";

/*
 * Next.js needs one param name per dynamic segment, so `[id]` serves both
 *   GET    /api/recipes/:idOrSlug   (public; drafts only for owner/admin)
 *   PATCH  /api/recipes/:id         (owner/admin)
 *   DELETE /api/recipes/:id         (owner/admin)
 */

const notFound = () => fail(404, "Recipe not found", { code: "NOT_FOUND" });

/** Load a recipe by id and verify the session user may modify it. */
async function loadOwned(id: string) {
  const user = await requireUser();
  if (!isValidObjectId(id)) throw new ApiError("Recipe not found", 404, { code: "NOT_FOUND" });
  await connectDB();
  const recipe = await Recipe.findById(id);
  if (!recipe) throw new ApiError("Recipe not found", 404, { code: "NOT_FOUND" });
  // Ownership is checked server-side against the stored author, never the request body
  if (!canModify(user, recipe.author.toString())) {
    throw new ApiError("You can only change your own recipes.", 403, { code: "FORBIDDEN" });
  }
  return recipe;
}

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/recipes/[id]">) {
  try {
    const { id } = await ctx.params;
    const recipe = isValidObjectId(id) ? await getRecipeById(id) : await getRecipeBySlug(id);
    if (!recipe) return notFound();

    if (recipe.status !== "published") {
      const user = await getSessionUser();
      // Hide drafts entirely (404, not 403) from everyone but the owner/admin
      if (!user || !canModify(user, recipe.author.id)) return notFound();
    }
    return ok(recipe);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/recipes/[id]">) {
  try {
    const { id } = await ctx.params;
    const recipe = await loadOwned(id);
    const input = recipeInputSchema.parse(await request.json().catch(() => ({})));

    // Keep published URLs stable; drafts follow their (possibly renamed) title
    const slug =
      recipe.status === "draft" && input.title !== recipe.title
        ? await generateUniqueSlug(input.title, recipe.id as string)
        : recipe.slug;

    const { steps, ...rest } = input;
    recipe.set({ ...rest, slug, steps: steps.map((s, index) => ({ ...s, order: index + 1 })) });
    await recipe.save(); // runs validate hooks → totalTime, ingredientNames

    return ok(await getRecipeById(recipe.id as string));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/recipes/[id]">) {
  try {
    const { id } = await ctx.params;
    const recipe = await loadOwned(id);
    await recipe.deleteOne();
    // Phase 5: also delete its reviews and pull it from users' savedRecipes
    return ok({ id });
  } catch (error) {
    return handleRouteError(error);
  }
}
