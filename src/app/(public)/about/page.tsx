import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "RecipeHub is a community recipe finder: search by dish or by the ingredients you already have, and share the recipes you love.",
};

const features = [
  {
    emoji: "🔍",
    title: "Find recipes your way",
    text: "Search by dish, cuisine or tag — or tell us what's in your kitchen and we'll match recipes to your ingredients.",
  },
  {
    emoji: "🧑‍🍳",
    title: "Share your own",
    text: "Write up the dishes you cook best, save drafts as you go, and publish when they're ready for the world.",
  },
  {
    emoji: "🥗",
    title: "Cook for every diet",
    text: "Filter for vegetarian, vegan, gluten-free, keto and Jain recipes so everyone at the table is covered.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="text-center">
        <p className="text-sm font-semibold tracking-widest text-brand uppercase">
          About RecipeHub
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
          Good food starts with a good recipe
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          RecipeHub is a home for everyday cooks. Discover dishes from kitchens around the world,
          cook with what you already have, and share the recipes that make your family ask for
          seconds.
        </p>
      </header>

      <section aria-labelledby="what-you-can-do" className="mt-14">
        <h2 id="what-you-can-do" className="sr-only">
          What you can do
        </h2>
        <ul className="grid gap-5 sm:grid-cols-3">
          {features.map((f) => (
            <li
              key={f.title}
              className="rounded-brand-lg border border-border bg-surface p-6 shadow-sm"
            >
              <p className="text-3xl" aria-hidden>
                {f.emoji}
              </p>
              <h3 className="mt-3 text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 rounded-brand-lg bg-brand-50 p-8 text-center dark:bg-brand-900/20">
        <h2 className="text-2xl font-bold tracking-tight">Got a recipe worth sharing?</h2>
        <p className="mx-auto mt-2 max-w-xl text-muted">
          Join the community — it&apos;s free. Your grandmother&apos;s dal or your weekend pasta
          could be someone&apos;s new favourite.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/recipes"
            className="rounded-brand-lg border border-border bg-surface px-5 py-2.5 font-semibold transition hover:border-brand hover:text-brand"
          >
            Browse recipes
          </Link>
          <Link
            href="/recipes/new"
            className="rounded-brand-lg bg-brand px-5 py-2.5 font-semibold text-white transition hover:bg-brand-700"
          >
            Share a recipe
          </Link>
        </div>
      </section>
    </div>
  );
}
