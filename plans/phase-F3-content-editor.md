# Phase F3 — Content editor (the resume-builder core)

**Ships**: the first full end-to-end milestone — a user can build up their content (roles,
bullets, skills, education) through a real UI, backed entirely by the real backend.

**Depends on**: F2 (auth), F0-1 (CORS `PUT`).

---

## Scope

- Content overview page (`GET /api/v1/content/`, empty-state → import).
- Nested roles → groups → bullets editor (tags, variant groups) via the granular CRUD endpoints
  (`app/api/content.py` in the backend — `POST`/`PUT`/`DELETE` per role/group/bullet) rather than
  one big `PUT /api/v1/content/` per keystroke.
- Taglines / skills / education editors (same granular-CRUD pattern).
- YAML import/export UI (`POST /api/v1/content/import`, `GET /api/v1/content/export`).
- Resume intake flow: upload PDF/DOCX/text → `POST /api/v1/content/intake` → review the returned
  draft → save via the existing `PUT /api/v1/content/` — **never auto-saved**, matching the
  backend's own "a human reviews an agent's output before it becomes real" rule (`CLAUDE.md`).

## Verification

Real create → edit → tag → reorder → delete flows against the real running backend for roles,
groups, and bullets; a real YAML import/export round-trip; a real resume upload through
`/content/intake` producing a draft that saves correctly via `PUT /content/`.
