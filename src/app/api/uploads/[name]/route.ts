import { readFile } from "node:fs/promises";
import path from "node:path";
import type { NextRequest } from "next/server";
import {
  IMAGE_MIME_BY_EXT,
  LOCAL_FILE_NAME_RE,
  LOCAL_UPLOAD_DIR,
  type ImageExt,
} from "@/lib/uploads";

/** GET /api/uploads/:name — serve a locally uploaded image (dev fallback storage). */
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/uploads/[name]">) {
  const { name } = await ctx.params;
  // Strict whitelist pattern → no "../" or other paths can be requested
  if (!LOCAL_FILE_NAME_RE.test(name)) return new Response("Not found", { status: 404 });

  try {
    const data = await readFile(path.join(LOCAL_UPLOAD_DIR, name));
    const ext = name.split(".").pop() as ImageExt;
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": IMAGE_MIME_BY_EXT[ext],
        // Names are random and never reused, so the content never changes
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
