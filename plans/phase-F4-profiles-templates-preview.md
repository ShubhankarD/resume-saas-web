# Phase F4 — Profiles, template gallery, live preview, PDF

**Ships**: the actual product differentiator — a Kickresume/Teal-style split-screen editor (form on
one side, live preview on the other) built on top of `resume-saas`'s richer content model, plus a
template gallery and real PDF export.

**Depends on**: F3 (content must exist to build a profile from), F0-2 (template wiring),
F0-3 (fast preview endpoint).

---

## Scope

- Profile CRUD list/detail: select/exclude bullets, variant-group choices, skills/groups order
  (`app/schemas/profile.py`'s `ProfileWrite`/`ProfilePatch` fields).
- Expose existing-but-currently-unused profile controls as real UI, not just plumbing: `density`
  (`"tight"`/`"relaxed"` — a spacing toggle), `max_pages`, `tagline`/`tagline_override`.
- **Template gallery**: consumes F0-2's template-list endpoint; switching templates re-renders the
  live preview against the same underlying content (per the competitive research: "the resume
  conforms to the template" should run in reverse here — the template conforms to the content).
- **Split-screen live preview**: editor controls on one side, a debounced (~400ms after the last
  edit) call to F0-3's fast HTML-preview endpoint rendered in a scaled `<iframe srcDoc>` on the
  other. This is the Kickresume/Teal pattern researched in `plans/README.md`, built on top of
  `resume-saas`'s content model rather than a flat form.
- Drag-and-drop reordering of roles/groups/bullets within the editor (reordering updates
  `groups_order`/per-role bullet ordering, reflected live in the preview).
- Real PDF build trigger (`POST /api/v1/builds/`) + download + build history
  (`GET /api/v1/builds/`).

## Verification

- Real profile create/edit against the running backend, including reordering and template
  switching, with the live preview visibly updating.
- A real PDF build/download for at least two different templates, confirming visually distinct
  output (extends F0-2's own verification from the consuming side).
