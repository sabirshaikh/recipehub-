import axios from "axios";
import http from "@/lib/axios";
import type { UploadMode, UploadSignature } from "@/types/upload";

export interface UploadedImage {
  url: string;
}

interface UploadOptions {
  mode: UploadMode;
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

const toPercent = (loaded: number, total?: number) =>
  total ? Math.round((loaded / total) * 100) : 0;

export const uploadService = {
  async getSignature(): Promise<UploadSignature> {
    // 503 (not configured) is handled by the upload UI — no global toast
    const res = await http.post<UploadSignature>("/upload/sign", undefined, {
      skipErrorNotification: true,
    });
    return res.data;
  },

  /** Direct browser → Cloudinary upload (plain axios: no `/api` baseURL or interceptors). */
  async uploadToCloudinary(file: File, { onProgress, signal }: Omit<UploadOptions, "mode">) {
    const sig = await uploadService.getSignature();
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", sig.apiKey);
    form.append("timestamp", String(sig.timestamp));
    form.append("folder", sig.folder);
    form.append("signature", sig.signature);

    const res = await axios.post<{ secure_url: string }>(
      `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
      form,
      {
        signal,
        timeout: 60_000,
        onUploadProgress: (e) => onProgress?.(toPercent(e.loaded, e.total)),
      },
    );
    return { url: res.data.secure_url };
  },

  /** Dev fallback: upload to this app's own disk storage. */
  async uploadToLocal(file: File, { onProgress, signal }: Omit<UploadOptions, "mode">) {
    const form = new FormData();
    form.append("file", file);
    const res = await http.post<UploadedImage>("/upload/local", form, {
      signal,
      timeout: 60_000,
      skipErrorNotification: true, // the upload field shows its own message
      onUploadProgress: (e) => onProgress?.(toPercent(e.loaded, e.total)),
    });
    return res.data;
  },

  uploadImage(file: File, { mode, ...options }: UploadOptions): Promise<UploadedImage> {
    return mode === "cloudinary"
      ? uploadService.uploadToCloudinary(file, options)
      : uploadService.uploadToLocal(file, options);
  },
};

export default uploadService;
