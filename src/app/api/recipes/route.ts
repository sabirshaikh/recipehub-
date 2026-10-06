import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { handleRouteError, ok } from "@/lib/api-response";
import { generateUniqueSlug, getRecipeById } from "@/lib/recipes";
import { requireUser } from "@/lib/session";
import { Recipe } from "@/models/Recipe";
import { recipeInputSchema } from "@/schemas/recipe";

// GET /api/recipes (list / search / filter / paginate) arrives in Phase 4.

/** POST /api/recipes — create a recipe (draft or published) as the signed-in user. */
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const input = recipeInputSchema.parse(await request.json().catch(() => ({})));

    await connectDB();
    const { steps, ...rest } = input;
    const doc = await Recipe.create({
      ...rest,
      steps: steps.map((s, index) => ({ ...s, order: index + 1 })),
      slug: await generateUniqueSlug(input.title),
      // Never trust a client-sent author — always the session user
      author: user.id,
    });

    return ok(await getRecipeById(doc.id as string), { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
