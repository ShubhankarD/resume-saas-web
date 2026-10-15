import { z } from "zod";

/** Keys for taglines and skill groups (and ids elsewhere) share one shape. */
export const CONTENT_KEY_PATTERN = /^[a-z0-9][a-z0-9-_]*$/;

export const CONTENT_KEY_PATTERN_MESSAGE = "Use lowercase letters, numbers, - or _";

export function contentKeySchema(requiredMessage = "Key is required") {
  return z
    .string()
    .min(1, requiredMessage)
    .max(80)
    .regex(CONTENT_KEY_PATTERN, CONTENT_KEY_PATTERN_MESSAGE);
}
