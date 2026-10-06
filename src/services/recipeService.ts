import http from "@/lib/axios";
import type { RecipeInput } from "@/schemas/recipe";
import type { RecipeDetail } from "@/types/recipe";

export const recipeService = {
  async getBySlug(slug: string, signal?: AbortSignal): Promise<RecipeDetail> {
    const res = await http.get<RecipeDetail>(`/recipes/${encodeURIComponent(slug)}`, { signal });
    return res.data;
  },

  async create(payload: RecipeInput): Promise<RecipeDetail> {
    // Validation errors are shown inline on the form — skip the global toast
    const res = await http.post<RecipeDetail>("/recipes", payload, { skipErrorNotification: true });
    return res.data;
  },

  async update(id: string, payload: RecipeInput): Promise<RecipeDetail> {
    const res = await http.patch<RecipeDetail>(`/recipes/${id}`, payload, {
      skipErrorNotification: true,
    });
    return res.data;
  },

  async remove(id: string): Promise<{ id: string }> {
    const res = await http.delete<{ id: string }>(`/recipes/${id}`);
    return res.data;
  },
};

export default recipeService;
