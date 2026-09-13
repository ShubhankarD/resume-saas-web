# Phase F2 — Auth

**Ships**: register, verify-email, login, forgot/reset-password, Google sign-in, and a protected
app shell — the full auth surface the backend's Phase 1 already exposes, consumed for the first
time by a real UI.

**Depends on**: F1 (typed client, `apiFetch()` skeleton).

---

## Scope

- `AuthProvider`/token store (access token in memory, refresh token in `localStorage` — see
  `plans/README.md`'s decision) + `apiFetch()`'s 401-triggered refresh-and-retry-once logic against
  the backend's existing `POST /api/v1/auth/refresh`.
- Register / verify-email (handles the backend's email-link flow) / login pages.
- Forgot-password / reset-password pages.
- **Google sign-in**: `POST /api/v1/auth/google` (`app/api/auth.py` in the backend) takes a Google
  **ID token** in the body — this is Google Identity Services' client-side JS flow (a rendered
  Google button hands the frontend an ID token directly), *not* a server-side OAuth
  redirect/callback. Needs the Google Identity Services script + a button component, not a redirect
  route.
- Protected app shell: nav, session state, logout, and a layout-level redirect to `/login` when
  there's no valid session.

## Verification

Real register → verify (email-link bypass matching the backend's own smoke-test convention, since
there's no real inbox in dev) → login → refresh-token rotation (force an access-token expiry and
confirm a request transparently retries through `/auth/refresh`) → logout, all against the real
running backend — not component-level tests with a mocked API.
