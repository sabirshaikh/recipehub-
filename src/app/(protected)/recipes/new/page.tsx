import type { Metadata } from "next";
import RecipeForm from "@/components/forms/RecipeForm";
import { getUploadMode } from "@/lib/uploads";

export const metadata: Metadata = { title: "Submit a recipe", robots: { index: false } };

export default function NewRecipePage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Submit a recipe</h1>
        <p className="mt-2 text-muted">
          Share a dish you love. Save it as a draft any time and publish when it&apos;s ready.
        </p>
      </header>
      <RecipeForm uploadMode={getUploadMode()} />
    </div>
  );
}
