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

/**
 * Only allow same-origin redirects. Accepts relative paths and absolute URLs on
 * our own origin (the proxy sends absolute ones); blocks `//evil.com` and other hosts.
 */
export function safeCallbackUrl(url: string | null | undefined, fallback = "/dashboard") {
  if (!url) return fallback;
  const appOrigin =
    typeof window === "undefined"
      ? new URL(process.env.AUTH_URL ?? "http://localhost:3000").origin
      : window.location.origin;
  try {
    const parsed = new URL(url, appOrigin);
    if (parsed.origin !== appOrigin) return fallback;
    const path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    // Never bounce back to the auth pages themselves
    return /^\/(login|register)(\/|\?|$)/.test(parsed.pathname + parsed.search) ? fallback : path;
  } catch {
    return fallback;
  }
}

const FRACTIONS: [number, string][] = [
  [0.125, "⅛"],
  [0.25, "¼"],
  [1 / 3, "⅓"],
  [0.5, "½"],
  [2 / 3, "⅔"],
  [0.75, "¾"],
];

/** 1.5 → "1½", 0.25 → "¼", 2.4 → "2.4" (null → ""). */
export function formatQuantity(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value) || value <= 0) return "";
  const whole = Math.floor(value);
  const rest = value - whole;
  if (rest < 0.01) return String(whole);
  const match = FRACTIONS.find(([f]) => Math.abs(rest - f) < 0.02);
  if (match) return `${whole || ""}${match[1]}`;
  return String(Math.round(value * 100) / 100);
}
