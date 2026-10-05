import type { paths } from "./schema";
import { createHttpClient, bearerAuth } from "@/lib/api/http";
import { browserAuthSession } from "@/lib/auth/session";

export { ApiError, getErrorMessage, throwIfNotOk } from "@/lib/api/http";

/**
 * Base URL of the resume-saas backend API, e.g. http://localhost:8000.
 * Must be set at build/runtime via NEXT_PUBLIC_API_URL since it's read on
 * the client as well as the server.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** The app's one HTTP client: the framework-free core from http.ts wired
 * to the browser session (see src/lib/auth/session.ts). */
const http = createHttpClient({
  baseUrl: API_BASE_URL,
  middleware: [bearerAuth(browserAuthSession)],
});

type Paths = paths;
type Method = "get" | "put" | "post" | "delete" | "options" | "head" | "patch" | "trace";

type OperationFor<P extends keyof Paths, M extends Method> = M extends keyof Paths[P]
  ? Paths[P][M]
  : never;

/** The JSON request body type for a given path+method, or `never` if it takes none. */
type RequestBodyFor<P extends keyof Paths, M extends Method> =
  OperationFor<P, M> extends {
    requestBody: { content: { "application/json": infer B } };
  }
    ? B
    : never;

/** The path-parameter object for a given path+method, or `never` if it has none. */
type PathParamsFor<P extends keyof Paths, M extends Method> =
  OperationFor<P, M> extends { parameters: { path: infer T } }
    ? [T] extends [undefined]
      ? never
      : NonNullable<T>
    : never;

/** The query-parameter object for a given path+method, or `never` if it has none. */
type QueryParamsFor<P extends keyof Paths, M extends Method> =
  OperationFor<P, M> extends { parameters: { query?: infer T } }
    ? [NonNullable<T>] extends [never]
      ? never
      : NonNullable<T>
    : never;

/** The JSON success-response (2xx) type for a given path+method. */
type SuccessResponseFor<P extends keyof Paths, M extends Method> =
  OperationFor<P, M> extends {
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
} & ([RequestBodyFor<P, M>] extends [never] ? { body?: never } : { body: RequestBodyFor<P, M> }) &
  ([PathParamsFor<P, M>] extends [never] ? { params?: never } : { params: PathParamsFor<P, M> }) &
  ([QueryParamsFor<P, M>] extends [never] ? { query?: never } : { query?: QueryParamsFor<P, M> });

/**
 * Fills `{name}` placeholders in an OpenAPI path template from `params`,
 * URI-encoding each value, and appends `query` as a query string.
 */
export function buildPath(
  template: string,
  params?: Record<string, string | number>,
  query?: Record<string, string | number | boolean | null | undefined>,
): string {
  const path = template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = params?.[name];
    if (value === undefined) throw new Error(`Missing path param "${name}" for ${template}`);
    return encodeURIComponent(String(value));
  });
  if (!query) return path;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) search.append(key, String(value));
  }
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
}

/**
 * Typed fetch wrapper around the backend API. `path` is the OpenAPI path
 * *template* (e.g. "/api/v1/builds/{build_id}") and `params` supplies its
 * placeholders, so request body, path params, query params and the
 * response type are all checked against schema.d.ts.
 *
 * Deliberately hand-written rather than a fully generated client (see
 * plans/README.md's architecture decisions) so that 401-refresh-retry logic
 * stays under our own control (see http.ts's `bearerAuth`).
 */
export async function apiFetch<P extends keyof Paths, M extends Method = "get">(
  path: P,
  options?: ApiFetchOptions<P, M>,
): Promise<SuccessResponseFor<P, M>> {
  const { method, params, query, ...rest } = (options ?? {}) as ApiFetchOptions<P, M> & {
    params?: Record<string, string | number>;
    query?: Record<string, string | number | boolean | null | undefined>;
  };
  const data = await http.json(buildPath(String(path), params, query), {
    ...rest,
    method: (method ?? "get").toUpperCase(),
  });
  return data as SuccessResponseFor<P, M>;
}

/** Calls the backend's health check endpoint (GET /api/v1/health). */
export function getHealth() {
  return apiFetch("/api/v1/health", { method: "get" });
}

/**
 * Raw fetch for requests apiFetch can't express — multipart/form-data
 * bodies (content import/intake) and non-JSON responses (YAML export, SSE
 * streams) — while still sharing apiFetch's auth-header injection and
 * one-shot 401-refresh-and-retry behavior. `init.body` is passed through
 * untouched (a `FormData` instance, typically) and no `Content-Type` header
 * is set so the browser can add the correct multipart boundary itself.
 *
 * Returns the raw `Response` so callers decide how to read it.
 */
export function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return http.send(path, init);
}
