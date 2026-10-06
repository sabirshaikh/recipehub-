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

/** "ingredients.2.name" → ["ingredients", 2, "name"] (antd NamePath). */
export function toNamePath(key: string): (string | number)[] {
  return key.split(".").map((part) => (/^\d+$/.test(part) ? Number(part) : part));
}

/**
 * Show `fieldErrors` (from ApiError or a client-side Zod check) inline on an antd form.
 * Keys may be dotted paths for nested Form.List fields. Returns true if any were applied.
 */
export function applyFieldErrors(form: FormInstance, fieldErrors: FieldErrors | undefined) {
  if (!fieldErrors) return false;
  const fields = Object.entries(fieldErrors)
    .filter(([key, errors]) => key !== "_form" && errors?.length)
    .map(([key, errors]) => ({ name: toNamePath(key), errors: errors ?? [] }));
  form.setFields(fields);
  if (fields[0]) form.scrollToField(fields[0].name, { behavior: "smooth", block: "center" });
  return fields.length > 0;
}

/** Client-side equivalent of the server's zodFieldErrors(). */
export function zodIssuesToFieldErrors(error: z.ZodError): FieldErrors {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "_form";
    (out[key] ??= []).push(issue.message);
  }
  return out;
}

/** Clear all currently shown field errors (before re-validating / re-submitting). */
export function clearFieldErrors(form: FormInstance) {
  form.setFields(
    form
      .getFieldsError()
      .filter((f) => f.errors.length)
      .map((f) => ({ name: f.name, errors: [] })),
  );
}

/** Leaf paths touched in an antd `onValuesChange` payload (sparse arrays for Form.List). */
function changedPaths(value: unknown, prefix: (string | number)[] = []): (string | number)[][] {
  if (Array.isArray(value)) {
    const paths: (string | number)[][] = [prefix]; // list-level errors (e.g. "add at least one")
    value.forEach((item, index) => paths.push(...changedPaths(item, [...prefix, index])));
    return paths;
  }
  if (value && typeof value === "object" && prefix.length > 0) {
    return Object.entries(value).flatMap(([k, v]) => changedPaths(v, [...prefix, k]));
  }
  return [prefix];
}

/**
 * Clear errors for fields the user just edited. Our Zod-driven errors are set
 * manually, so antd would otherwise keep showing them after the field is fixed.
 */
export function clearChangedFieldErrors(form: FormInstance, changedValues: object) {
  const touched = Object.entries(changedValues).flatMap(([key, v]) => changedPaths(v, [key]));
  const startsWith = (name: (string | number)[], prefix: (string | number)[]) =>
    prefix.every((p, i) => name[i] === p);
  const stale = form
    .getFieldsError()
    .filter(
      (f) => f.errors.length && touched.some((t) => startsWith(f.name, t) || startsWith(t, f.name)),
    );
  if (stale.length) form.setFields(stale.map((f) => ({ name: f.name, errors: [] })));
}
