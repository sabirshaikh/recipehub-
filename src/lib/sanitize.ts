/**
 * Plain-text sanitizer for user input stored in the DB (names, bios, comments…).
 * React already escapes output; this is defense in depth so stored text never
 * contains markup or control characters, even if rendered elsewhere later.
 */
export function sanitizeText(input: string) {
  return (
    input
      // Drop HTML tags
      .replace(/<[^>]*>/g, "")
      // Drop control chars except tab / newline / carriage return
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
      .trim()
  );
}
