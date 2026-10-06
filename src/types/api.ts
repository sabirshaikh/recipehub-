/** Pagination / list metadata returned alongside list responses. */
export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  [key: string]: unknown;
}

export type FieldErrors = Record<string, string[] | undefined>;

export interface ApiErrorBody {
  message: string;
  code?: string;
  fieldErrors?: FieldErrors;
}

/** Standard JSON envelope for every API route. */
export interface ApiEnvelope<T = unknown> {
  success: boolean;
  data: T | null;
  error: ApiErrorBody | null;
  meta: ApiMeta | null;
}

export interface Paginated<T> {
  items: T[];
  meta: ApiMeta;
}
