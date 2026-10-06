/** Signed params for a direct browser → Cloudinary upload (POST /api/upload/sign). */
export interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

/** "cloudinary" when configured; otherwise "local" (dev-only disk storage). */
export type UploadMode = "cloudinary" | "local";
