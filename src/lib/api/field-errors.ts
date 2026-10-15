import { getErrorField, getErrorMessage } from "@/lib/api/http";

export interface FieldError {
  field: string;
  message: string;
}

/**
 * Splits a server error into the part that belongs on an input and the part
 * that doesn't. Returns the field error when the backend scoped the error to
 * one of `fields` (the inputs this form actually renders); `null` means the
 * caller should fall back to the general alert. A field the form doesn't
 * render (e.g. `"file"` on the URL form) deliberately falls back too, so the
 * message is never silently dropped.
 */
export function toFieldError(error: unknown, fields: readonly string[]): FieldError | null {
  const field = getErrorField(error);
  if (field === undefined || !fields.includes(field)) return null;
  return { field, message: getErrorMessage(error) };
}
