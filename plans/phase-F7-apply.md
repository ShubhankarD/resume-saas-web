# Phase F7 — Apply

**Ships**: a user can point the agent at a real job posting, watch it fill out the form live in an
embedded browser, and confirm or cancel — the frontend surface for the backend's Phase 8.

**Depends on**: F4 (need a resume/cover-letter build to apply with). F0-4 (VNC auth) before this
ships to real users — can build/test locally against the unauthenticated URL in the meantime.

---

## Scope

- Job creation form: job URL + resume/cover-letter build selection
  (`POST /api/v1/applications/`).
- Live session view: an embedded noVNC iframe (`vnc_url` from
  `GET /api/v1/applications/{id}`) so the user watches the agent live, plus F6's shared
  `<JobActivityFeed>` rendering the same SSE event vocabulary.
- Confirm-submit / cancel controls (`POST /api/v1/applications/{id}/confirm-submit`,
  `POST /api/v1/applications/{id}/cancel`) — these are pure bookkeeping on the backend (the human
  clicks the real Submit button themselves, inside the VNC session); the frontend's job is just to
  expose those two buttons clearly, not to attempt any automation of its own.

This is the riskiest phase UX-wise (embedding a live remote desktop cleanly, handling a container
that can take a few seconds to become reachable) — expect to revisit specifics (loading states,
iframe sizing, connection-lost handling) once actually building it, not fully spec'd here.

## Verification

The embedded VNC iframe actually shows the live Chromium session from a real container (not a
placeholder); confirm-submit/cancel actually tear the container down, reusing the backend's
already-proven container lifecycle (`resume-saas`'s #139/#149/#150). Do this against F0-4's real
auth mechanism once it exists — don't ship this phase against the unauthenticated URL.
