import type { Category, DietTag, Difficulty, RecipeStatus } from "@/lib/constants";

export interface Ingredient {
  quantity: number | null;
  unit: string;
  name: string;
}

export interface RecipeStep {
  order: number;
  text: string;
  image: string;
}

export interface RecipeAuthor {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

/** Lightweight shape for cards / lists. */
export interface RecipeSummary {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  cuisine: string;
  category: Category;
  dietTags: DietTag[];
  difficulty: Difficulty;
  totalTime: number;
  servings: number;
  averageRating: number;
  ratingsCount: number;
  savesCount: number;
  status: RecipeStatus;
  author: RecipeAuthor;
  createdAt: string;
}

export interface RecipeDetail extends RecipeSummary {
  prepTime: number;
  cookTime: number;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  tags: string[];
  updatedAt: string;
}
