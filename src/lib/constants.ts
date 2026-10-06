/** Recipe taxonomy shared by models, Zod schemas, filters and UI. */

export const CATEGORIES = ["breakfast", "lunch", "dinner", "dessert", "snack", "drink"] as const;
export type Category = (typeof CATEGORIES)[number];

export const DIET_TAGS = ["vegetarian", "vegan", "gluten-free", "keto", "jain"] as const;
export type DietTag = (typeof DIET_TAGS)[number];

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const CUISINES = [
  "Indian",
  "Italian",
  "Mexican",
  "Chinese",
  "Thai",
  "Japanese",
  "Greek",
  "Spanish",
  "French",
  "American",
  "Middle Eastern",
  "Moroccan",
] as const;
export type Cuisine = (typeof CUISINES)[number];

export const RECIPE_STATUSES = ["draft", "published"] as const;
export type RecipeStatus = (typeof RECIPE_STATUSES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  dessert: "Dessert",
  snack: "Snack",
  drink: "Drink",
};

export const DIET_LABELS: Record<DietTag, string> = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  "gluten-free": "Gluten-free",
  keto: "Keto",
  jain: "Jain",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};
