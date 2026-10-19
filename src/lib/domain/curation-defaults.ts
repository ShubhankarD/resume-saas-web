import type { CurationCreate } from "@/lib/api/curations";

/**
 * The backend defaults for a curation's optional knobs (see
 * `app/schemas/curation.py`'s DEFAULT_MIN_SCORE etc.). openapi-typescript
 * generates `CurationCreate` with them required — FastAPI does not mark a
 * field with a default as non-required — so they are passed explicitly,
 * which keeps the request a plain typed object rather than an `as` cast.
 */
export function newCurationRequest(values: {
  jd_id: string;
  profile_name: string;
}): CurationCreate {
  return {
    jd_id: values.jd_id,
    profile_name: values.profile_name,
    min_score: 8.5,
    max_score_gate_attempts: 3,
    max_turns: 40,
  };
}
