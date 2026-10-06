import { z } from "zod";
import { CATEGORIES, CUISINES, DIET_TAGS, DIFFICULTIES, RECIPE_STATUSES } from "@/lib/constants";
import { sanitizeText } from "@/lib/sanitize";

/** Plain text that is sanitized (tags/control chars stripped) before length checks. */
const text = (min: number, max: number, label: string) =>
  z
    .string({ error: `${label} is required` })
    .transform(sanitizeText)
    .pipe(
      z
        .string()
        .min(min, min <= 1 ? `${label} is required` : `${label} must be at least ${min} characters`)
        .max(max, `${label} must be at most ${max} characters`),
    );

/** Optional https image URL ("" = no image). */
const imageUrl = z
  .string()
  .trim()
  .max(1000)
  .refine(
    // https URL, or an image uploaded to this app's local dev storage
    (v) =>
      v === "" ||
      /^https:\/\/\S+$/i.test(v) ||
      /^\/api\/uploads\/[a-f0-9]{24}-[a-f0-9]{32}\.(jpg|png|webp|avif)$/.test(v),
    "Image must be an https:// URL",
  )
  .default("");

const minutes = (label: string) =>
  z
    .number({ error: `${label} is required` })
    .int(`${label} must be whole minutes`)
    .min(0, `${label} can't be negative`)
    .max(24 * 60, `${label} must be at most 24 hours`);

export const ingredientSchema = z.object({
  quantity: z
    .number()
    .positive("Quantity must be greater than 0")
    .max(100_000)
    .nullable()
    .default(null),
  unit: z.string().trim().max(20, "Unit is too long").default(""),
  name: text(1, 120, "Ingredient"),
});

export const stepSchema = z.object({
  text: text(3, 2000, "Step"),
  image: imageUrl,
});

/**
 * Shared by the recipe form (client) and POST/PATCH /api/recipes (server).
 * Server-computed fields (slug, totalTime, ingredientNames, ratings, author) are
 * never accepted from the client.
 */
export const recipeInputSchema = z.object({
  title: text(3, 120, "Title"),
  description: text(10, 1000, "Description"),
  coverImage: imageUrl,
  cuisine: z.enum(CUISINES, { error: "Choose a cuisine" }),
  category: z.enum(CATEGORIES, { error: "Choose a category" }),
  dietTags: z.array(z.enum(DIET_TAGS)).max(DIET_TAGS.length).default([]),
  difficulty: z.enum(DIFFICULTIES, { error: "Choose a difficulty" }),
  prepTime: minutes("Prep time"),
  cookTime: minutes("Cook time"),
  servings: z
    .number({ error: "Servings is required" })
    .int()
    .min(1, "At least 1 serving")
    .max(100, "At most 100 servings"),
  ingredients: z
    .array(ingredientSchema)
    .min(1, "Add at least one ingredient")
    .max(60, "At most 60 ingredients"),
  steps: z.array(stepSchema).min(1, "Add at least one step").max(50, "At most 50 steps"),
  tags: z
    .array(z.string().transform(sanitizeText).pipe(z.string().toLowerCase().min(1).max(30)))
    .max(15, "At most 15 tags")
    .default([])
    .transform((tags) => [...new Set(tags)]),
  status: z.enum(RECIPE_STATUSES).default("draft"),
});

export type RecipeInput = z.output<typeof recipeInputSchema>;
export type RecipeFormValues = z.input<typeof recipeInputSchema>;
