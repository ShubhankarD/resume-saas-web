import type { paths } from "./schema";

/**
 * Base URL of the resume-saas backend API, e.g. http://localhost:8000.
 * Must be set at build/runtime via NEXT_PUBLIC_API_URL since it's read on
 * the client as well as the server.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Auth header injection point.
 *
 * Stubbed as a no-op for F1 (scaffold) — there is no auth token to attach
 * yet. F2 (auth) replaces this with a real implementation that reads the
 * in-memory access token (see plans/phase-F2-auth.md: access token in
 * memory, refresh token in localStorage, refreshed via
 * POST /api/v1/auth/refresh on a 401) and returns an `Authorization` header,
 * plus wires up 401-refresh-retry in `apiFetch` below.
 */
function getAuthHeader(): Record<string, string> {
  return {};
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

type Paths = paths;

/**
 * Extracts the 200-response JSON body type for a given GET path from the
 * generated OpenAPI schema, so callers get real typed responses without
 * hand-writing them.
 */
type GetResponse<P extends keyof Paths> = Paths[P] extends {
  get: {
    responses: {
      200: {
        content: {
          "application/json": infer T;
        };
      };
    };
  };
}
  ? T
  : never;

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

/**
 * Thin typed fetch wrapper around the backend API.
 *
 * Deliberately hand-written rather than a fully generated client (see
 * plans/README.md's architecture decisions) so that 401-refresh-retry logic
 * (added in F2) stays under our own control instead of being generated.
 */
export async function apiFetch<P extends keyof Paths>(
  path: P,
  options: ApiFetchOptions = {},
): Promise<GetResponse<P>> {
  const { body, headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${String(path)}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return data as GetResponse<P>;
}

/** Calls the backend's health check endpoint (GET /api/v1/health). */
export function getHealth() {
  return apiFetch("/api/v1/health", { method: "GET" });
}
