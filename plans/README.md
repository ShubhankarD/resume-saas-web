# resume-saas-web — Implementation Plans

Next.js frontend for [`resume-saas`](https://github.com/ShubhankarD/resume-saas) — AI-powered
resume building, evaluation, and job application automation.

**Stack**: Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui + TanStack Query

**Backend repo**: [`resume-saas`](https://github.com/ShubhankarD/resume-saas) — all 9 backend
phases are complete; this frontend consumes its REST/SSE API.

## Why now

Per `resume-saas/plans/README.md`'s own sequencing decision, this frontend was deliberately
deferred until the backend API surface stabilized: "the Next.js frontend starts after Phase 8, not
concurrently with the backend phases... there's also not much of a product to put a UI on until
profiles, PDF rendering, and evaluation exist." That condition is now met — all 9 backend phases
(auth, content, profiles, builds, evaluation, curation, apply, resume intake) are merged.

## Competitive context

Researched two shapes of competitor before designing this:

- **ResumeNow**: a pure linear wizard — fixed conservative single-column templates the *content*
  must conform to, no split-screen preview, no drag-and-drop reordering, no density/hierarchy
  control. Confirmed directly (not just inferred): no live preview panel exists in its editor at
  all — the template is only applied at the end.
- **Kickresume / Teal**: the shape actually worth emulating — a **split-screen editor**: form/
  content on one side, a live-updating preview on the other, drag-and-drop section/bullet
  reordering, and font/spacing/color controls, all reflected in the preview as you type.

`resume-saas`'s backend already has a materially richer content model than any of these (tagged/
variant-group bullets, profiles that *select and resolve* a subset of content per job) — the
differentiated product is the Kickresume/Teal split-screen pattern (live preview + template
gallery + drag-reorder editor), built on top of that richer model. Concretely: `Profile` already
has a `density: "tight"|"relaxed"` field (`app/schemas/profile.py` in the backend) — an existing
spacing control F4 should expose as a toggle, not invent a new one.

## Phases

| # | Phase | Ships | Depends on |
|---|-------|-------|-----------|
| F0 | [Backend prerequisites](phase-F0-backend-prereqs.md) | Small fixes shipped in `resume-saas` itself (CORS, template wiring, preview endpoint, VNC auth) | — |
| F1 | [Scaffold + design system](phase-F1-scaffold.md) | Repo, Tailwind/shadcn, typed API client, CI | F0-1..3 for later phases |
| F2 | [Auth](phase-F2-auth.md) | Register/login/OAuth, protected app shell | F1 |
| F3 | [Content editor](phase-F3-content-editor.md) | The resume-builder core: roles/groups/bullets, intake | F2, F0-1 |
| F4 | [Profiles + templates + preview](phase-F4-profiles-templates-preview.md) | Template gallery, live preview, PDF build | F3, F0-2, F0-3 |
| F5 | [Evaluations](phase-F5-evaluations.md) | JD input, score + judge feedback display | F4 |
| F6 | [AI curation](phase-F6-curation.md) | Live agent activity feed, review-and-save draft | F4 |
| F7 | [Apply](phase-F7-apply.md) | Embedded live browser session, confirm-submit/cancel | F4, F0-4 |

F5-F7 can be resequenced relative to each other if priorities shift; F1-F4 are the necessary
foundation and should ship in order.

## Architecture decisions (cross-cutting, apply to every phase)

- **Repo**: separate from `resume-saas` (different toolchain/deploy target — Vercel vs. GCP VM — no
  shared code). Public, matching the backend repo.
- **Auth token storage**: access token in memory, refresh token in `localStorage`, refreshed via
  the backend's existing `POST /api/v1/auth/refresh` on a 401. No backend changes needed for this.
  (Rejected for v1: httpOnly cookies — more secure, but requires the backend to switch from
  JSON-body tokens to `Set-Cookie` first.)
- **Styling**: Tailwind + shadcn/ui (Radix-based, copy-in components, no heavy dependency
  lock-in).
- **Deployment**: Vercel — zero-config for Next.js, decouples frontend deploys from the backend's
  GCP VM entirely.
- **Server state**: TanStack Query (caching, invalidation after mutations). **Client-only state**
  (access token/current user): a small store (Zustand or plain Context).
- **API types**: generated from the backend's live `/openapi.json` via `openapi-typescript`,
  paired with a thin hand-written `apiFetch()` (not a fully generated client) so 401-refresh-retry
  stays under our own control.
- **Forms**: `react-hook-form` + `zod` resolvers for client-side UX validation only — the backend's
  Pydantic validation remains the actual source of truth.
- **CI**: lightweight GitHub Actions (`pnpm lint`, `tsc --noEmit`, `pnpm build`) on every PR — cheap
  (no LLM/infra cost), unlike `resume-saas`'s own disabled CI (which was specifically about the
  cost of real Postgres/Redis/Docker integration runs).
- **Real-time (curation + apply)**: the backend's `ProgressPublisher`/`SyncProgressPublisher`
  already publish a shared, typed discriminated union over SSE (`tool_call`, `score`, `completed`,
  `failed`, `awaiting_review`, `cancelled` — see `resume-saas/app/services/progress_publisher.py`).
  One typed `useJobProgress(streamUrl)` hook + one shared `<JobActivityFeed>` component render both
  curation's and apply's live feeds — don't build two bespoke feeds.

## Working conventions

Same discipline as `resume-saas` (see its `CLAUDE.md`): branch + PR per issue, verify against the
real running backend (not mocks) before calling an issue done, wait for explicit merge approval,
split out unplanned scope into a new issue rather than silently expanding one in progress.
