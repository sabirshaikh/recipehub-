"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recipeKeys, userKeys } from "@/lib/queryKeys";
import { recipeService } from "@/services/recipeService";
import type { RecipeInput } from "@/schemas/recipe";
import type { RecipeDetail } from "@/types/recipe";

/** Refresh every cached view a recipe write can affect. */
function useInvalidateRecipe() {
  const queryClient = useQueryClient();
  return (recipe?: Pick<RecipeDetail, "slug">) => {
    void queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
    void queryClient.invalidateQueries({ queryKey: userKeys.myRecipes() });
    if (recipe) void queryClient.invalidateQueries({ queryKey: recipeKeys.detail(recipe.slug) });
  };
}

export function useCreateRecipe() {
  const invalidate = useInvalidateRecipe();
  return useMutation({
    mutationFn: (payload: RecipeInput) => recipeService.create(payload),
    onSuccess: (recipe) => invalidate(recipe),
  });
}

export function useUpdateRecipe(id: string) {
  const invalidate = useInvalidateRecipe();
  return useMutation({
    mutationFn: (payload: RecipeInput) => recipeService.update(id, payload),
    onSuccess: (recipe) => invalidate(recipe),
  });
}

export function useDeleteRecipe() {
  const invalidate = useInvalidateRecipe();
  return useMutation({
    mutationFn: (recipe: Pick<RecipeDetail, "id" | "slug">) => recipeService.remove(recipe.id),
    onSuccess: (_data, recipe) => invalidate(recipe),
  });
}
