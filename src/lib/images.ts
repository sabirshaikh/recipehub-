/**
 * Hosts that next/image may optimize — keep in sync with `images.remotePatterns`
 * in next.config.ts. Images from any other https host (pasted URLs) are rendered
 * with `unoptimized` so they still display.
 */
export const OPTIMIZED_IMAGE_HOSTS = [
  "res.cloudinary.com",
  "www.themealdb.com",
  "www.thecocktaildb.com",
  "lh3.googleusercontent.com",
];

export function isOptimizableImage(src: string) {
  try {
    const { protocol, hostname } = new URL(src);
    return protocol === "https:" && OPTIMIZED_IMAGE_HOSTS.includes(hostname);
  } catch {
    return false;
  }
}

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
