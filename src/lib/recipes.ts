import "server-only";
import { isValidObjectId, type Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { CATEGORIES, type Category } from "@/lib/constants";
import { Recipe } from "@/models/Recipe";
import "@/models/User"; // registers the User model for populate()
import type { RecipeAuthor, RecipeDetail, RecipeSummary } from "@/types/recipe";

/*
 * Server-side recipe queries used by Server Components (no HTTP round-trip).
 * Phase 4 extends listing with full filters, sorting and pagination.
 */

const SUMMARY_FIELDS =
  "title slug description coverImage cuisine category dietTags difficulty totalTime servings averageRating ratingsCount savesCount status author createdAt";
const AUTHOR_FIELDS = "name username avatar";

interface PopulatedAuthor {
  _id: Types.ObjectId;
  name: string;
  username: string;
  avatar?: string;
}

type LeanRecipe = Record<string, unknown> & {
  _id: Types.ObjectId;
  author: PopulatedAuthor | null;
  createdAt: Date;
  updatedAt?: Date;
};

function toAuthor(author: PopulatedAuthor | null): RecipeAuthor {
  if (!author) return { id: "", name: "Deleted user", username: "", avatar: "" };
  return {
    id: author._id.toString(),
    name: author.name,
    username: author.username,
    avatar: author.avatar ?? "",
  };
}

function toSummary(doc: LeanRecipe): RecipeSummary {
  const { _id, author, createdAt, ...rest } = doc;
  return {
    ...(rest as unknown as Omit<RecipeSummary, "id" | "author" | "createdAt">),
    id: _id.toString(),
    author: toAuthor(author),
    createdAt: createdAt.toISOString(),
  };
}

export interface ListRecipesOptions {
  q?: string;
  category?: string;
  limit?: number;
}

export function isCategory(value: unknown): value is Category {
  return typeof value === "string" && (CATEGORIES as readonly string[]).includes(value);
}

export async function listPublishedRecipes({
  q,
  category,
  limit = 24,
}: ListRecipesOptions = {}): Promise<RecipeSummary[]> {
  await connectDB();

  const filter: Record<string, unknown> = { status: "published" };
  if (isCategory(category)) filter.category = category;
  const text = q?.trim().slice(0, 100);
  if (text) filter.$text = { $search: text };

  const docs = await Recipe.find(filter)
    .select(SUMMARY_FIELDS)
    .sort(text ? { score: { $meta: "textScore" }, createdAt: -1 } : { createdAt: -1 })
    .limit(Math.min(Math.max(limit, 1), 60))
    .populate("author", AUTHOR_FIELDS)
    .lean<LeanRecipe[]>();

  return docs.map(toSummary);
}

/** All recipes by one author — drafts included — newest first (for the owner's dashboard). */
export async function listRecipesByAuthor(authorId: string): Promise<RecipeSummary[]> {
  if (!isValidObjectId(authorId)) return [];
  await connectDB();
  const docs = await Recipe.find({ author: authorId })
    .select(SUMMARY_FIELDS)
    .sort({ createdAt: -1 })
    .populate("author", AUTHOR_FIELDS)
    .lean<LeanRecipe[]>();
  return docs.map(toSummary);
}

export async function getPublishedRecipeBySlug(slug: string): Promise<RecipeDetail | null> {
  await connectDB();
  const doc = await Recipe.findOne({ slug: slug.toLowerCase(), status: "published" })
    .select("-ingredientNames -__v")
    .populate("author", AUTHOR_FIELDS)
    .lean<LeanRecipe>();
  if (!doc) return null;

  // toSummary strips _id/author/createdAt; also drop updatedAt so it isn't a raw Date
  const { updatedAt, ...rest } = doc;
  return {
    ...(toSummary(rest as LeanRecipe) as RecipeDetail),
    updatedAt: (updatedAt ?? doc.createdAt).toISOString(),
  };
}

/** Other published recipes in the same category or cuisine. */
export async function getRelatedRecipes(recipe: RecipeDetail, limit = 4): Promise<RecipeSummary[]> {
  await connectDB();
  const docs = await Recipe.find({
    status: "published",
    slug: { $ne: recipe.slug },
    $or: [{ category: recipe.category }, { cuisine: recipe.cuisine }],
  })
    .select(SUMMARY_FIELDS)
    .sort({ averageRating: -1, createdAt: -1 })
    .limit(limit)
    .populate("author", AUTHOR_FIELDS)
    .lean<LeanRecipe[]>();
  return docs.map(toSummary);
}
