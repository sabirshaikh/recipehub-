"use client";

import type { FormInstance } from "antd";
import type { Rule } from "antd/es/form";
import type { z } from "zod";
import type { FieldErrors } from "@/types/api";

/**
 * antd Form rule that validates one field against a Zod object schema,
 * so the client uses the exact same rules as the API.
 */
export function zodRule<S extends z.ZodObject>(schema: S, field: keyof S["shape"] & string): Rule {
  const fieldSchema = schema.shape[field] as z.ZodType;
  return {
    validator: async (_rule, value: unknown) => {
      const result = await fieldSchema.safeParseAsync(value ?? "");
      if (!result.success) throw new Error(result.error.issues[0]?.message ?? "Invalid value");
    },
  };
}

/** Show server-side `fieldErrors` (from ApiError) inline on an antd form. */
export function applyFieldErrors(form: FormInstance, fieldErrors: FieldErrors | undefined) {
  if (!fieldErrors) return false;
  const fields = Object.entries(fieldErrors)
    .filter(([, errors]) => errors?.length)
    .map(([name, errors]) => ({ name, errors: errors ?? [] }));
  form.setFields(fields);
  return fields.length > 0;
}
