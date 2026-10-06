import Link from "next/link";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/constants";
import { cn } from "@/lib/utils";

const EMOJI: Record<Category, string> = {
  breakfast: "🥞",
  lunch: "🥗",
  dinner: "🍛",
  dessert: "🍰",
  snack: "🥨",
  drink: "🥤",
};

export default function CategoryChips({ active }: { active?: string }) {
  return (
    <nav aria-label="Browse by category" className="flex flex-wrap justify-center gap-2">
      <Link
        href="/recipes"
        className={cn(
          "rounded-full border px-4 py-1.5 text-sm font-medium transition",
          !active
            ? "border-brand bg-brand text-white"
            : "border-border bg-surface hover:border-brand hover:text-brand",
        )}
        aria-current={!active ? "page" : undefined}
      >
        All
      </Link>
      {CATEGORIES.map((c) => (
        <Link
          key={c}
          href={`/recipes?category=${c}`}
          aria-current={active === c ? "page" : undefined}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition",
            active === c
              ? "border-brand bg-brand text-white"
              : "border-border bg-surface hover:border-brand hover:text-brand",
          )}
        >
          <span aria-hidden>{EMOJI[c]}</span> {CATEGORY_LABELS[c]}
        </Link>
      ))}
    </nav>
  );
}
