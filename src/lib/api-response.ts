import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiError } from "@/lib/api-error";
import type { ApiEnvelope, ApiMeta, FieldErrors } from "@/types/api";

/** Success response in the standard `{ success, data, error, meta }` envelope. */
export function ok<T>(data: T, init: { status?: number; meta?: ApiMeta } = {}) {
  return NextResponse.json<ApiEnvelope<T>>(
    { success: true, data, error: null, meta: init.meta ?? null },
    { status: init.status ?? 200 },
  );
}

export function fail(
  status: number,
  message: string,
  options: { code?: string; fieldErrors?: FieldErrors; headers?: HeadersInit } = {},
) {
  return NextResponse.json<ApiEnvelope<null>>(
    {
      success: false,
      data: null,
      error: { message, code: options.code, fieldErrors: options.fieldErrors },
      meta: null,
    },
    { status, headers: options.headers },
  );
}

/** Map any thrown error to a consistent JSON error response. */
export function handleRouteError(error: unknown) {
  if (error instanceof z.ZodError) {
    return fail(422, "Validation failed", {
      code: "VALIDATION_ERROR",
      fieldErrors: z.flattenError(error).fieldErrors as FieldErrors,
    });
  }
  if (error instanceof ApiError) {
    return fail(error.status, error.message, {
      code: error.code,
      fieldErrors: error.fieldErrors,
    });
  }
  console.error("[api] unhandled error", error);
  return fail(500, "Internal server error", { code: "INTERNAL_ERROR" });
}
