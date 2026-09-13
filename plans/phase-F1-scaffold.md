# Phase F1 — Scaffold, design system, typed API client

**Ships**: a running Next.js app with the design system, a typed API client generated from the
backend's OpenAPI schema, and CI — nothing user-facing yet, the foundation every later phase
builds on.

**Depends on**: nothing (can start immediately). F0-1..3 are needed before F3/F4 start using their
endpoints, not before this phase.

---

## Scope

- Next.js 15 (App Router) + TypeScript + `pnpm` scaffold.
- ESLint + Prettier configured; Vercel project created and linked (see `plans/README.md`'s
  deployment decision).
- Tailwind + shadcn/ui installed; base design tokens/theme (colors, spacing, typography) — enough
  for F2's auth pages, not a full component inventory up front.
- `openapi-typescript` codegen script pulling types from the backend's `/openapi.json` (run
  against a local `resume-saas` instance during development; regenerate whenever the backend
  schema changes — not committed as a one-time snapshot that goes stale).
- A thin `apiFetch()` wrapper (auth header injection point stubbed here, wired up for real in F2)
  — not a fully generated client, so 401-refresh-retry logic stays hand-written and controllable.
- Lightweight GitHub Actions CI: `pnpm lint`, `tsc --noEmit`, `pnpm build` on every PR. No deploy
  step — Vercel's own GitHub integration handles preview/prod deploys.
- This `plans/` directory itself (already committed as part of kicking off this phase).

## Verification

- `pnpm build` succeeds locally against a real `NEXT_PUBLIC_API_URL` pointed at a locally running
  `resume-saas` instance (`docker compose up -d` + `uvicorn` + `arq` worker there).
- The OpenAPI codegen script runs against that live instance and produces real, non-empty
  TypeScript types matching the backend's actual current schema.
- CI is green on the first PR that adds it.
