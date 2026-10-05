/**
 * Framework-free HTTP core for the backend API — no React, no Zustand, no
 * localStorage. Everything environment-specific comes in through
 * `HttpClientConfig` (the base URL, a `fetch` implementation, and an
 * `AuthSession`), so this module can be unit-tested with a fake fetch and a
 * fake session, and reused anywhere a different session source exists.
 *
 * Requests run through a small middleware chain (`Middleware`): each one
 * can decorate the request and/or inspect the response before handing it
 * back. The default chain is just `bearerAuth`, which injects the access
 * token and performs the one-shot 401-refresh-and-retry.
 */

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
          .map((entry) =>
            entry && typeof entry === "object" && "msg" in entry ? String(entry.msg) : null,
          )
          .filter((m): m is string => Boolean(m));
        if (messages.length > 0) return messages.join("; ");
      }
    }
    return fallback;
  }
  return fallback;
}

/** Reads a response body as JSON when the server says it's JSON, else text.
 * An empty body reads as `undefined` — the backend's 204s still carry
 * `content-type: application/json`, and `response.json()` on an empty body
 * throws. */
export async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text === "") return undefined;
  const isJson = response.headers.get("content-type")?.includes("application/json");
  return isJson ? JSON.parse(text) : text;
}

/** Throws ApiError from a non-ok Response, parsing its body the same way
 * `HttpClient.json` does so getErrorMessage() works uniformly. */
export async function throwIfNotOk(response: Response): Promise<void> {
  if (response.ok) return;
  throw new ApiError(response.status, await readBody(response));
}

/**
 * The session abstraction the HTTP core depends on (instead of importing
 * the auth store directly). `refresh()` must be safe to call concurrently —
 * implementations are expected to de-duplicate in-flight refreshes.
 */
export interface AuthSession {
  getAccessToken(): string | null;
  /** Attempts to obtain a fresh access token; resolves `true` on success. */
  refresh(): Promise<boolean>;
}

export interface HttpRequest {
  path: string;
  init: RequestInit;
}

export type Send = (request: HttpRequest) => Promise<Response>;
export type Middleware = (request: HttpRequest, next: Send) => Promise<Response>;

/**
 * Injects `Authorization: Bearer …` when a session exists, and on a 401
 * from an *authenticated* request attempts exactly one refresh, retrying
 * the original request once on success. An unauthenticated call (e.g.
 * /auth/login itself) never triggers a refresh.
 */
export function bearerAuth(session: AuthSession): Middleware {
  return async (request, next) => {
    const send = (token: string | null) =>
      next({
        ...request,
        init: {
          ...request.init,
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...request.init.headers,
          },
        },
      });

    const token = session.getAccessToken();
    const response = await send(token);
    if (response.status !== 401 || !token) return response;

    const refreshed = await session.refresh();
    return refreshed ? send(session.getAccessToken()) : response;
  };
}

export interface HttpClientConfig {
  baseUrl: string;
  middleware?: Middleware[];
  fetch?: typeof fetch;
}

export interface HttpClient {
  /** Raw request through the middleware chain; the caller reads the body. */
  send(path: string, init?: RequestInit): Promise<Response>;
  /** JSON request: serializes `body`, throws ApiError on non-2xx, returns
   * the parsed JSON (or text, for a non-JSON response). */
  json(path: string, init?: Omit<RequestInit, "body"> & { body?: unknown }): Promise<unknown>;
}

export function createHttpClient({
  baseUrl,
  middleware = [],
  fetch: fetchImpl = (...args) => fetch(...args),
}: HttpClientConfig): HttpClient {
  const terminal: Send = ({ path, init }) => fetchImpl(`${baseUrl}${path}`, init);
  const chain = middleware.reduceRight<Send>(
    (next, mw) => (request) => mw(request, next),
    terminal,
  );

  return {
    send(path, init = {}) {
      return chain({ path, init });
    },
    async json(path, { body, headers, ...rest } = {}) {
      const response = await chain({
        path,
        init: {
          ...rest,
          headers: { "Content-Type": "application/json", ...headers },
          body: body !== undefined ? JSON.stringify(body) : undefined,
        },
      });
      const data = await readBody(response);
      if (!response.ok) throw new ApiError(response.status, data);
      return data;
    },
  };
}
