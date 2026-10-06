import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { NextRequest } from "next/server";
import { fail, handleRouteError, ok } from "@/lib/api-response";
import { MAX_IMAGE_BYTES } from "@/lib/images";
import { createRateLimiter } from "@/lib/rate-limit";
import { requireUser } from "@/lib/session";
import {
  LOCAL_UPLOAD_DIR,
  LOCAL_UPLOAD_URL_PREFIX,
  getUploadMode,
  sniffImageType,
} from "@/lib/uploads";

const uploadLimiter = createRateLimiter({ limit: 30, windowMs: 10 * 60 * 1000 });

/**
 * POST /api/upload/local — dev fallback when Cloudinary isn't configured.
 * Accepts multipart `file`, verifies it's really an image (magic bytes), and
 * stores it under `.uploads/` with a random, unguessable name.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    if (getUploadMode() !== "local") {
      return fail(400, "Use the Cloudinary upload flow.", { code: "USE_CLOUDINARY" });
    }
    if (!uploadLimiter(`upload:${user.id}`).ok) {
      return fail(429, "Too many uploads. Please wait a few minutes.", { code: "RATE_LIMITED" });
    }

    const form = await request.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) {
      return fail(422, "No image received.", { code: "VALIDATION_ERROR" });
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return fail(413, "Images must be 5 MB or smaller.", { code: "FILE_TOO_LARGE" });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const ext = sniffImageType(bytes);
    if (!ext) {
      return fail(415, "Please upload a JPG, PNG, WebP or AVIF image.", {
        code: "UNSUPPORTED_TYPE",
      });
    }

    const name = `${user.id}-${randomBytes(16).toString("hex")}.${ext}`;
    await mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(LOCAL_UPLOAD_DIR, name), bytes);

    return ok({ url: `${LOCAL_UPLOAD_URL_PREFIX}${name}` }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
