import { z } from "zod";

/** Keys for taglines and skill groups (and ids elsewhere) share one shape. */
export const CONTENT_KEY_PATTERN = /^[a-z0-9][a-z0-9-_]*$/;

export const CONTENT_KEY_PATTERN_MESSAGE = "Use lowercase letters, numbers, - or _";

/** A key/id that is well-formed and not already in `taken` (adding with an
 * existing key would otherwise silently overwrite that entry). */
export function contentKeySchema(
  requiredMessage = "Key is required",
  taken: readonly string[] = [],
  takenMessage = "That key is already used",
) {
  return z
    .string()
    .min(1, requiredMessage)
    .max(80)
    .regex(CONTENT_KEY_PATTERN, CONTENT_KEY_PATTERN_MESSAGE)
    .refine((key) => !taken.includes(key), takenMessage);
}
