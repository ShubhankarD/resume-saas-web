import { z } from "zod";
import type { BulletCreate, BulletUpdate, GroupCreate } from "@/lib/api/content";
import { contentKeySchema } from "@/lib/domain/content-key";
import { blankToUndefined } from "@/lib/domain/text";

/**
 * Form schemas and form-values → API-body mapping for the content editors'
 * bullet and group forms. The schemas deliberately avoid `.transform()`
 * (react-hook-form's generics get awkward when a schema's input and output
 * types diverge): form values stay plain strings, and blank optional fields
 * become `undefined` once, in the mapping function.
 */

export const bulletSchema = z.object({
  text: z.string().min(1, "Bullet text is required").max(2000),
  tags: z.array(z.string()),
  variant_group: z.string().max(80),
});
export type BulletFormValues = z.infer<typeof bulletSchema>;

export const bulletCreateSchema = bulletSchema.extend({ id: contentKeySchema("Id is required") });
export type BulletCreateFormValues = z.infer<typeof bulletCreateSchema>;

export const EMPTY_BULLET_CREATE: BulletCreateFormValues = {
  id: "",
  text: "",
  tags: [],
  variant_group: "",
};

export function toBulletBody(values: BulletFormValues): BulletUpdate {
  return {
    text: values.text,
    tags: values.tags,
    variant_group: blankToUndefined(values.variant_group),
  };
}

export function toBulletCreateBody(values: BulletCreateFormValues): BulletCreate {
  return { id: values.id, ...toBulletBody(values) };
}

export const groupCreateSchema = z.object({
  id: contentKeySchema("Id is required"),
  heading: z.string().max(200),
});
export type GroupCreateFormValues = z.infer<typeof groupCreateSchema>;

export const groupUpdateSchema = z.object({ heading: z.string().max(200) });
export type GroupUpdateFormValues = z.infer<typeof groupUpdateSchema>;

export function toGroupCreateBody(values: GroupCreateFormValues): GroupCreate {
  return { id: values.id, heading: blankToUndefined(values.heading) };
}

/** The fields a role has when created and when edited. */
export const roleFieldsSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  org: z.string().min(1, "Organization is required").max(200),
  dates: z.string().min(1, "Dates are required").max(100),
});
