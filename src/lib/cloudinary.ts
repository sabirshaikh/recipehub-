import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { getEnv } from "@/lib/env";

export const CLOUDINARY_FOLDER = "recipehub";

let configured = false;

/** Server-side Cloudinary SDK, configured from env on first use. */
export function getCloudinary() {
  if (!configured) {
    const env = getEnv();
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
      throw new Error("Cloudinary env vars are not configured");
    }
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}
