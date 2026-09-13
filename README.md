# resume-saas-web

Next.js frontend for [`resume-saas`](https://github.com/ShubhankarD/resume-saas) — AI-powered
resume building, evaluation, and job application automation.

**Stack**: Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui + `pnpm`.

See `plans/README.md` for the full phase breakdown and architecture decisions.

## Getting started

```bash
pnpm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_URL at your local backend
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The home page calls the backend's
`GET /api/v1/health` endpoint end-to-end and renders the live result, so you'll need the
`resume-saas` backend running locally (see below) to see real data instead of an error.

## Running against a local backend

This repo has no backend of its own — point it at a locally running `resume-saas` instance:

```bash
cd ../resume-saas
docker compose up -d              # Postgres, Redis, MinIO
uvicorn app.main:app --reload     # serves http://localhost:8000, including /openapi.json
```

Then, in this repo:

```bash
pnpm codegen   # regenerates src/lib/api/schema.d.ts from the live /openapi.json
pnpm dev
```

`pnpm build` does **not** require the backend to be reachable — the home page's health check is a
dynamic (server-rendered on demand) route, not statically generated at build time.

## Scripts

| Script                         | What it does                                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `pnpm dev`                     | Start the dev server                                                                                               |
| `pnpm build`                   | Production build (also what CI runs)                                                                               |
| `pnpm lint`                    | ESLint                                                                                                             |
| `pnpm typecheck`               | `tsc --noEmit`                                                                                                     |
| `pnpm format` / `format:check` | Prettier write / check                                                                                             |
| `pnpm codegen`                 | Regenerate `src/lib/api/schema.d.ts` from the backend's live `/openapi.json` (dev-time only, not run during build) |

## API client

- `src/lib/api/schema.d.ts` — generated types from the backend's OpenAPI schema (`openapi-typescript`). Regenerate with `pnpm codegen` whenever the backend schema changes; it's committed as a snapshot, not build-time-generated.
- `src/lib/api/client.ts` — a thin hand-written `apiFetch()` wrapper (not a fully generated client) so 401-refresh-retry logic can be added by hand in a later phase (F2 — auth) without fighting codegen. The auth-header injection point (`getAuthHeader()`) is currently a stubbed no-op; F2 wires it up for real.

## Design system

Tailwind + [shadcn/ui](https://ui.shadcn.com) (`base-nova` preset, Radix-based, copy-in
components — no heavy dependency lock-in). Base tokens live in `src/app/globals.css`. Add more
components with:

```bash
pnpm dlx shadcn@latest add <component>
```

## Deployment (Vercel)

This project is intended to deploy on Vercel via its GitHub integration (zero-config for Next.js;
no deploy step in this repo's CI — see `.github/workflows/ci.yml`).

**Not done in this environment**: this sandbox has no Vercel account/CLI access, so no real Vercel
project has been created or linked here. To link one for real:

```bash
pnpm add -g vercel   # or: pnpm dlx vercel
vercel login
vercel link          # creates/links a Vercel project to this repo
vercel env add NEXT_PUBLIC_API_URL production   # and preview/development as needed
```

Once linked, connect the GitHub repo in the Vercel dashboard so every push/PR gets a
preview/production deployment automatically — no changes needed here beyond that.

## CI

`.github/workflows/ci.yml` runs `pnpm lint`, `pnpm exec tsc --noEmit`, and `pnpm build` on every
push/PR. No deploy step — Vercel's own GitHub integration handles previews/production deploys.
