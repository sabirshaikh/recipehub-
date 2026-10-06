import type { FieldErrors } from "@/types/api";

/** Normalized error thrown by the API client (and usable on the server). */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly fieldErrors?: FieldErrors;

  constructor(
    message: string,
    status: number,
    options: { code?: string; fieldErrors?: FieldErrors } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = options.code;
    this.fieldErrors = options.fieldErrors;
  }

  /** status 0 = no response (network error, timeout, CORS). */
  get isNetworkError() {
    return this.status === 0;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
