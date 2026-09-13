# Phase F5 — Evaluations

**Ships**: a user can score a profile against a job description and see deterministic metrics plus
LLM-judge feedback.

**Depends on**: F4 (need a profile to evaluate).

---

## Scope

- JD CRUD: text / file upload / URL input (`app/api/jds.py` in the backend).
- Trigger an evaluation against a chosen profile + JD, display deterministic metrics and the
  LLM-judge's structured feedback (strengths/gaps/suggestions — see `app/services/curation/
  judge.py`'s schema in the backend for the exact shape to render).

## Verification

Real JD create (all three input modes) → real evaluation run against the real backend (spends
real, capped LLM tokens — same opt-in caution as the backend's own `scripts/smoke_test.py
--with-evaluation`) → feedback renders correctly.
