import { useEffect, useMemo } from "react";
import { toFieldError, type FieldError } from "@/lib/api/field-errors";

/**
 * Maps a server error onto a form input. When `error` is scoped to one of
 * `fields`, `apply` is called once with it (typically react-hook-form's
 * `setError`) and the hook returns `null`; otherwise it returns `error`
 * unchanged for the form's general `<ErrorMessage>` alert. One hook shared by
 * every JD form instead of per-form mapping.
 */
export function useServerFieldError(
  error: unknown,
  fields: readonly string[],
  apply: (fieldError: FieldError) => void,
): unknown {
  // Joined so an inline `fields` array doesn't defeat the memo.
  const key = fields.join("\0");
  const fieldError = useMemo(() => toFieldError(error, key.split("\0")), [error, key]);

  useEffect(() => {
    if (fieldError) apply(fieldError);
    // `apply` is deliberately not a dependency: callers pass an inline closure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldError]);

  return fieldError ? null : error;
}
