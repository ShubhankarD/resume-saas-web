import { AlertCircle } from "lucide-react";
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
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm leading-6 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
    >
      <AlertCircle aria-hidden="true" className="mt-1 size-3.5 shrink-0" />
      <span className="min-w-0 break-words">{getErrorMessage(error)}</span>
    </div>
  );
}
