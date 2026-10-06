/**
 * Centralized React Query keys. Hierarchical so invalidating a prefix
 * (e.g. `recipeKeys.lists()`) refreshes every matching query.
 */
export type RecipeListFilters = Record<string, unknown>;

export const recipeKeys = {
  all: ["recipes"] as const,
  lists: () => [...recipeKeys.all, "list"] as const,
  list: (filters: RecipeListFilters) => [...recipeKeys.lists(), filters] as const,
  byIngredients: (ingredients: string[], page = 1) =>
    [...recipeKeys.all, "by-ingredients", { ingredients, page }] as const,
  details: () => [...recipeKeys.all, "detail"] as const,
  detail: (slug: string) => [...recipeKeys.details(), slug] as const,
  featured: () => [...recipeKeys.all, "featured"] as const,
  trending: () => [...recipeKeys.all, "trending"] as const,
  related: (slug: string) => [...recipeKeys.all, "related", slug] as const,
};

export const reviewKeys = {
  all: ["reviews"] as const,
  byRecipe: (recipeId: string, page = 1) => [...reviewKeys.all, recipeId, { page }] as const,
};

export const userKeys = {
  all: ["users"] as const,
  me: () => [...userKeys.all, "me"] as const,
  profile: (username: string) => [...userKeys.all, "profile", username] as const,
  myRecipes: (filters: RecipeListFilters = {}) =>
    [...userKeys.all, "me", "recipes", filters] as const,
  saved: (page = 1) => [...userKeys.all, "me", "saved", { page }] as const,
};

export const adminKeys = {
  all: ["admin"] as const,
  recipes: (filters: RecipeListFilters) => [...adminKeys.all, "recipes", filters] as const,
  users: (filters: RecipeListFilters) => [...adminKeys.all, "users", filters] as const,
};
