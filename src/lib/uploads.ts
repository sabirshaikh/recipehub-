import "server-only";
import path from "node:path";
import type { UploadMode } from "@/types/upload";

/**
 * Where uploaded images go:
 *  - "cloudinary" when CLOUDINARY_* env vars are set (production setup)
 *  - "local"      otherwise — files saved under `.uploads/` and served by
 *                 GET /api/uploads/[name]. Meant for local development only:
 *                 serverless/ephemeral hosts don't keep files on disk.
 */
export function getUploadMode(): UploadMode {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  return CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET
    ? "cloudinary"
    : "local";
}

export const LOCAL_UPLOAD_DIR = path.join(process.cwd(), ".uploads");
export const LOCAL_UPLOAD_URL_PREFIX = "/api/uploads/";

/** `<24-hex user id>-<32-hex random>.<ext>` — strict so no path traversal is possible. */
export const LOCAL_FILE_NAME_RE = /^[a-f0-9]{24}-[a-f0-9]{32}\.(jpg|png|webp|avif)$/;

export const IMAGE_MIME_BY_EXT = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
} as const;

export type ImageExt = keyof typeof IMAGE_MIME_BY_EXT;

/** Detect the real image type from magic bytes (never trust the client's MIME type). */
export function sniffImageType(bytes: Uint8Array): ImageExt | null {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes[0] === 0x89 && ascii(1, 4) === "PNG" && bytes[4] === 0x0d && bytes[5] === 0x0a) {
    return "png";
  }
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  if (ascii(4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(8, 12))) return "avif";
  return null;
}
