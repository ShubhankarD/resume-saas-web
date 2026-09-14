import { getErrorMessage } from "@/lib/api/client";

/**
 * Surfaces a real backend error (422 validation detail arrays, 404, 401,
 * etc.) rather than a generic "something went wrong" — see
 * getErrorMessage() in src/lib/api/client.ts, which already parses both of
 * the backend's error shapes (a plain string `detail`, or FastAPI's own
 * validation-error array of `{msg, loc, type}` objects).
 */
export function ErrorMessage({ error }: { error: unknown }) {
  if (!error) return null;
  return (
    <p
      role="alert"
      className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm"
    >
      {getErrorMessage(error)}
    </p>
  );
}
