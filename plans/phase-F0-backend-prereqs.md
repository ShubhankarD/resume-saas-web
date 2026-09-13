# Phase F0 — Backend prerequisites

**Ships**: four small, scoped changes in the `resume-saas` backend repo (not this one) that later
frontend phases depend on. Filed and shipped there, tracked here only for visibility.

**Depends on**: nothing new — all four build on already-merged backend code.

---

Found while researching this frontend's architecture (see `plans/README.md`'s cross-cutting
decisions). Each is its own scoped issue in `resume-saas`, not folded into a frontend issue.

## F0-1 — Fix `CORS_ALLOW_METHODS` to include `PUT`

`settings.CORS_ALLOW_METHODS` (`app/config.py`) defaults to `GET,POST,PATCH,DELETE` — no `PUT`,
even though `content`/`profiles` are PUT-heavy (`PUT /api/v1/content/`, `PUT
/api/v1/profiles/{id}`, `PUT /api/v1/content/roles/{role_id}`, etc.). Any browser frontend calling
these cross-origin fails CORS preflight today. Trivial fix — add `PUT` to the default (and confirm
any deployment-level override also includes it). **Blocks F3.**

## F0-2 — Wire `Profile.template` into the render pipeline

`ProfileWrite`/`ProfilePatch` (`app/schemas/profile.py`) already carry a `template: str =
"resume.html.j2"` field, faithfully ported from `_original`'s profile schema. But
`app/services/render_service.py` hardcodes `TEMPLATE_NAME = "resume.html.j2"` at module level and
never reads `profile.template` — every build renders with the same one template regardless of what
a profile actually has stored.

This is a port gap, not new design — `_original/build.py:559-566` already had the general
mechanism:

```python
template_name = profile.get("template", TEMPLATE_NAME)
if not (TEMPLATE_DIR / template_name).exists():
    raise ...  # clear error, not a silent fallback
template = env.get_template(template_name)
```

Port this pattern into `render_service.py`, author 2-3 additional `.html.j2` templates alongside
the existing `resume.html.j2` (e.g. a two-column layout, a compact-dense layout), and add a small
`GET /api/v1/templates/` (or equivalent static-list endpoint) the frontend's gallery (F4) can
enumerate. Low-risk — restoring already-designed behavior. **Blocks F4's template gallery.**

## F0-3 — Fast, PDF-pipeline-free HTML preview endpoint

`render_service.py`'s full pipeline (`measure_fill` — two real headless-Chromium renders to
compute `fill_pct` — then a real PDF conversion) takes real wall-clock seconds per call. A
live-typing preview (F4) needs sub-second feedback and can't call this on every keystroke.

**Decision** (weighed against reimplementing templates natively in React — rejected, since it
would mean two implementations of every template that must be kept pixel-identical by hand, the
"second copy of a pattern" problem `resume-saas/CLAUDE.md`'s modularization discipline warns
about): add a new endpoint that reuses the *same* Jinja2 templates and skips `measure_fill`/PDF
conversion, returning raw HTML (`template.render(**context, stretch=1.0)`) for the frontend to
show in a scaled `<iframe srcDoc=...>`. Single source of truth between preview and final PDF.
`fill_pct`/exact pagination may differ slightly from the true PDF (preview skips the two-pass
stretch computation) — an accepted tradeoff for editing feedback; "Download PDF" always calls the
real pipeline. **Blocks F4's live preview.**

## F0-4 — Authenticate noVNC session URLs

`BrowserSessionService.create_session` (`app/services/browser_session_service.py`) returns
`vnc_url = f"http://localhost:{host_port}"` with **no token, no auth check**. Anyone who obtains
that URL (guessed port, logged URL, a bug elsewhere) can connect to that job's live browser
session. Fine for local dev, but must close before F7 (Apply) ships to real users.

Not designed in full here — scope the exact mechanism when picked up. Two candidates: a
per-session random token appended to the URL that the container's websockify config checks, or
reverse-proxying VNC traffic through the already-authenticated FastAPI app (bigger lift). **Does
not block F1-F6** — F7 can build/test against the unauthenticated URL locally in the meantime.

## Verification

- F0-1: a real cross-origin `fetch` from a local Next.js dev server hitting `PUT
  /api/v1/content/` actually succeeds (not just that the config value changed).
- F0-2: a real build renders with each template id, producing a valid, visually distinct PDF —
  extend `resume-saas/scripts/smoke_test.py`'s existing PDF-verification pattern to loop over
  template ids.
- F0-3: the fast endpoint's HTML output visually matches the real PDF's layout for the same
  profile (spot-check, not pixel-diffed).
- F0-4: verify the chosen mechanism actually rejects an unauthenticated connection attempt, not
  just that a valid one still works.
