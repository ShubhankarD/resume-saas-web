import type { paths } from "./schema";
import { useAuthStore } from "@/lib/auth/store";
import { readRefreshToken, storeTokens, clearTokens } from "@/lib/auth/token-storage";

/**
 * Base URL of the resume-saas backend API, e.g. http://localhost:8000.
 * Must be set at build/runtime via NEXT_PUBLIC_API_URL since it's read on
 * the client as well as the server.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Auth header injection point.
 *
 * Reads the in-memory access token from the Zustand auth store (see
 * plans/phase-F2-auth.md: access token in memory, refresh token in
 * localStorage). Returns no header at all when there is no session yet —
 * that's the signal apiFetch uses below to decide whether a 401 is worth a
 * refresh-and-retry (an unauthenticated call, e.g. /auth/login itself,
 * never triggers one).
 */
function getAuthHeader(): Record<string, string> {
  const token = useAuthStore.getState().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`API request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/**
 * Extracts a human-readable message from an ApiError's response body,
 * matching the backend's two error shapes (see app/main.py's AppError
 * handler and FastAPI's own 422 validation errors):
 *   - `{"detail": "some message"}` — every app-level error (401/403/404/409/422/…)
 *   - `{"detail": [{"loc": [...], "msg": "...", "type": "..."}]}` — FastAPI's
 *     own request-validation 422s (e.g. malformed email format)
 */
export function getErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (err instanceof ApiError) {
    const body = err.body;
    if (body && typeof body === "object" && "detail" in body) {
      const detail = (body as { detail?: unknown }).detail;
      if (typeof detail === "string") return detail;
      if (Array.isArray(detail)) {
        const messages = detail
          .map((entry) => (entry && typeof entry === "object" && "msg" in entry ? String(entry.msg) : null))
          .filter((m): m is string => Boolean(m));
        if (messages.length > 0) return messages.join("; ");
      }
    }
    return fallback;
  }
  return fallback;
}

type Paths = paths;
type Method = "get" | "put" | "post" | "delete" | "options" | "head" | "patch" | "trace";

type OperationFor<P extends keyof Paths, M extends Method> = M extends keyof Paths[P]
  ? Paths[P][M]
  : never;

/** The JSON request body type for a given path+method, or `never` if it takes none. */
type RequestBodyFor<P extends keyof Paths, M extends Method> = OperationFor<P, M> extends {
  requestBody: { content: { "application/json": infer B } };
}
  ? B
  : never;

/** The JSON success-response (2xx) type for a given path+method. */
type SuccessResponseFor<P extends keyof Paths, M extends Method> = OperationFor<P, M> extends {
  responses: infer R;
}
  ? {
      [K in keyof R]: K extends 200 | 201 | 204
        ? R[K] extends { content: { "application/json": infer T } }
          ? T
          : R[K] extends { content?: never }
            ? void
            : never
        : never;
    }[keyof R]
  : never;

type ApiFetchOptions<P extends keyof Paths, M extends Method> = Omit<
  RequestInit,
  "body" | "method"
> & {
  method?: M;
} & ([RequestBodyFor<P, M>] extends [never]
    ? { body?: never }
    : { body: RequestBodyFor<P, M> });

/**
 * Thin typed fetch wrapper around the backend API.
 *
 * Deliberately hand-written rather than a fully generated client (see
 * plans/README.md's architecture decisions) so that 401-refresh-retry logic
 * stays under our own control instead of being generated.
 *
 * On a 401 from an *authenticated* request (one that carried an
 * Authorization header), attempts exactly one POST /api/v1/auth/refresh
 * using the refresh token in localStorage; on success it updates the store
 * and retries the original request once, on failure it clears the session
 * so protected UI redirects to /login.
 */
export async function apiFetch<P extends keyof Paths, M extends Method = "get">(
  path: P,
  options?: ApiFetchOptions<P, M>,
): Promise<SuccessResponseFor<P, M>> {
  return doFetch(path, options, false);
}

async function doFetch<P extends keyof Paths, M extends Method>(
  path: P,
  options: ApiFetchOptions<P, M> | undefined,
  isRetry: boolean,
): Promise<SuccessResponseFor<P, M>> {
  const { body, headers, method, ...rest } = options ?? ({} as ApiFetchOptions<P, M>);
  const authHeader = getAuthHeader();

  const response = await fetch(`${API_BASE_URL}${String(path)}`, {
    ...rest,
    method: method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && !isRetry && Object.keys(authHeader).length > 0) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return doFetch(path, options, true);
    }
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return data as SuccessResponseFor<P, M>;
}

let inFlightRefresh: Promise<boolean> | null = null;

/**
 * Performs the single refresh attempt described in apiFetch's docstring.
 * Deliberately uses a raw fetch (not apiFetch) to avoid recursing back into
 * this same 401-handling path. De-duplicated via inFlightRefresh so
 * concurrent 401s (e.g. several requests in flight at once) share one
 * refresh call instead of racing to rotate the same refresh token N times —
 * the backend revokes a refresh token the moment it's used (see
 * app/api/auth.py's refresh(): `stored.revoked = True`), so a second,
 * independent refresh call with the now-already-used token would 401.
 */
async function tryRefresh(): Promise<boolean> {
  if (inFlightRefresh) return inFlightRefresh;

  inFlightRefresh = (async () => {
    const refreshToken = readRefreshToken();
    if (!refreshToken) {
      useAuthStore.getState().clearSession();
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        clearTokens();
        useAuthStore.getState().clearSession();
        return false;
      }

      const data = (await response.json()) as { access_token: string; refresh_token: string };
      storeTokens(data.refresh_token);
      useAuthStore.getState().setAccessToken(data.access_token);
      return true;
    } catch {
      clearTokens();
      useAuthStore.getState().clearSession();
      return false;
    }
  })();

  try {
    return await inFlightRefresh;
  } finally {
    inFlightRefresh = null;
  }
}

/** Calls the backend's health check endpoint (GET /api/v1/health). */
export function getHealth() {
  return apiFetch("/api/v1/health", { method: "get" });
}
