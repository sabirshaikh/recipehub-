"use client";

import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import qs from "qs";
import { ApiError } from "@/lib/api-error";
import notify from "@/lib/notify";
import type { ApiEnvelope, ApiMeta } from "@/types/api";

declare module "axios" {
  interface AxiosRequestConfig {
    /** Don't redirect to /login on 401 (e.g. optional "who am I" checks). */
    skipAuthRedirect?: boolean;
    /** Don't show the global antd notification for this request's errors. */
    skipErrorNotification?: boolean;
  }
  interface AxiosResponse {
    /** Envelope `meta`, lifted by the response interceptor. */
    meta?: ApiMeta | null;
  }
}

/**
 * Shared Axios instance for all browser → `/api` requests.
 * Never call axios/fetch from components — go through `src/services/*`.
 */
export const http = axios.create({
  baseURL: "/api",
  timeout: 15_000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  // dietTags=vegan&dietTags=keto ; drops null/undefined/"" values
  paramsSerializer: {
    serialize: (params) =>
      qs.stringify(params, {
        arrayFormat: "repeat",
        skipNulls: true,
        filter: (_prefix, value) => (value === "" ? undefined : value),
      }),
  },
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.headers.set("X-Requested-With", "XMLHttpRequest");
  // Let the browser set the multipart boundary for uploads
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    config.headers.delete("Content-Type");
  }
  return config;
});

function isEnvelope(body: unknown): body is ApiEnvelope {
  return typeof body === "object" && body !== null && "success" in body && "data" in body;
}

function redirectToLogin() {
  if (typeof window === "undefined") return;
  const { pathname, search } = window.location;
  if (pathname.startsWith("/login")) return;
  const callbackUrl = encodeURIComponent(`${pathname}${search}`);
  // Full navigation on purpose: runs outside React (no router) and resets client state
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign(`/login?callbackUrl=${callbackUrl}`);
}

function toApiError(error: AxiosError<unknown>): ApiError {
  const { response } = error;

  if (!response) {
    const timedOut = error.code === "ECONNABORTED" || error.code === "ETIMEDOUT";
    return new ApiError(
      timedOut ? "The request timed out." : "Network error. Check your connection.",
      0,
      { code: error.code },
    );
  }

  const body = response.data;
  if (isEnvelope(body) && body.error) {
    return new ApiError(body.error.message, response.status, {
      code: body.error.code,
      fieldErrors: body.error.fieldErrors,
    });
  }
  return new ApiError(error.message || "Something went wrong.", response.status);
}

http.interceptors.response.use(
  // Unwrap `{ success, data, error, meta }` → response.data = data, response.meta = meta
  (response: AxiosResponse) => {
    const body: unknown = response.data;
    if (isEnvelope(body)) {
      response.meta = body.meta;
      response.data = body.data;
    }
    return response;
  },
  (error: unknown) => {
    // Aborted (e.g. React Query cancelled a stale search) — propagate silently
    if (axios.isCancel(error)) return Promise.reject(error);
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const apiError = toApiError(error);
    const config = error.config;
    const silent = config?.skipErrorNotification;

    switch (apiError.status) {
      case 0:
        if (!silent) notify.error("Check your connection", apiError.message, "network");
        break;
      case 401:
        if (!config?.skipAuthRedirect) redirectToLogin();
        break;
      case 403:
        if (!silent) notify.error("You don't have permission", apiError.message, "forbidden");
        break;
      case 429:
        if (!silent) {
          notify.warning("Slow down", "Too many requests. Please try again in a moment.", "rate");
        }
        break;
      default:
        if (apiError.status >= 500 && !silent) {
          notify.error("Server error", apiError.message, "server");
        }
    }

    return Promise.reject(apiError);
  },
);

export default http;
