import { fail, handleRouteError, ok } from "@/lib/api-response";
import { CLOUDINARY_FOLDER, getCloudinary } from "@/lib/cloudinary";
import { getEnv } from "@/lib/env";
import { requireUser } from "@/lib/session";
import type { UploadSignature } from "@/types/upload";

/**
 * POST /api/upload/sign — signature for a direct browser → Cloudinary upload.
 * The API secret never leaves the server; only these signed params are returned.
 */
export async function POST() {
  try {
    const user = await requireUser();
    const env = getEnv();
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
      return fail(503, "Image upload isn't configured on this server.", {
        code: "UPLOAD_NOT_CONFIGURED",
      });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = `${CLOUDINARY_FOLDER}/${user.id}`;
    const signature = getCloudinary().utils.api_sign_request(
      { timestamp, folder },
      env.CLOUDINARY_API_SECRET,
    );

    return ok<UploadSignature>({
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      timestamp,
      folder,
      signature,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
