/**
 * Plain GET form → /recipes?q=… (works without JS).
 * Phase 4 upgrades this with ingredient search and suggestions.
 */
export default function HeroSearch({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form action="/recipes" method="get" role="search" className="mx-auto flex max-w-xl gap-2">
      <label htmlFor="hero-search" className="sr-only">
        Search recipes
      </label>
      <input
        id="hero-search"
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Try “paneer”, “pasta” or “curry”"
        className="h-12 min-w-0 flex-1 rounded-brand-lg border border-border bg-surface px-4 text-base shadow-sm outline-none placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/30"
      />
      <button
        type="submit"
        className="h-12 rounded-brand-lg bg-brand px-6 font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Search
      </button>
    </form>
  );
}
