/** Join class names, skipping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** Escape user input before using it inside a RegExp / Mongo `$regex`. */
export function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** "Paneer Butter Masala!" → "paneer-butter-masala" */
export function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Normalize an ingredient name for matching: lowercase, trimmed, single spaces. */
export function normalizeIngredient(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, " ");
}

/** 95 → "1 hr 35 min" */
export function formatMinutes(total: number) {
  if (!Number.isFinite(total) || total <= 0) return "0 min";
  const h = Math.floor(total / 60);
  const m = Math.round(total % 60);
  if (!h) return `${m} min`;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}
