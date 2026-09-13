# Phase F6 — AI curation

**Ships**: a user can ask an AI agent to draft a JD-tailored profile, watch it work live, and
review/save the result.

**Depends on**: F4 (drafted profiles are `Profile` rows, same editor applies to them).

---

## Scope

- Trigger `POST /api/v1/curations/` against a chosen JD.
- **`<JobActivityFeed>`** (shared component — see `plans/README.md`'s real-time architecture
  decision): a typed `useJobProgress(streamUrl)` hook wrapping `EventSource`, rendering the
  backend's shared SSE event vocabulary (`tool_call`, `score`, `completed`, `failed`,
  `awaiting_review`, `cancelled`) live as the agent works — first built here, reused as-is by F7.
- Review-and-save the drafted profile via F4's own editor (never auto-saved, per the backend's
  human-review rule) — curation output becomes just another `Profile` a human edits before it's
  real.

## Verification

Real curation job triggered against the real backend + a real running arq worker; the activity
feed shows real, live tool-call events (not a mocked stream); the resulting draft opens correctly
in F4's editor for review.
