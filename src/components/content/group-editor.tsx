"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ConfirmDeleteButton } from "@/components/content/confirm-delete-button";
import { ErrorMessage } from "@/components/content/error-message";
import { BulletRow, BulletCreateForm } from "@/components/content/bullet-row";
import type { GroupIn, GroupUpdate, BulletCreate, BulletUpdate } from "@/lib/api/content";

const groupUpdateSchema = z.object({
  heading: z.string().max(200),
});
type GroupUpdateFormValues = z.infer<typeof groupUpdateSchema>;

/**
 * One bullet group inside a role, rendered as a collapsible section rather
 * than a card of its own — the role already provides the card surface, and
 * nesting cards inside cards is what made this editor feel like an admin
 * tool. Must be rendered inside an `<Accordion>`.
 */
export function GroupEditor({
  group,
  onUpdateGroup,
  onDeleteGroup,
  onCreateBullet,
  onUpdateBullet,
  onDeleteBullet,
}: {
  group: GroupIn;
  onUpdateGroup: (body: GroupUpdate) => Promise<unknown>;
  onDeleteGroup: () => void;
  onCreateBullet: (body: BulletCreate) => Promise<unknown>;
  onUpdateBullet: (bulletId: string, body: BulletUpdate) => Promise<unknown>;
  onDeleteBullet: (bulletId: string) => void;
}) {
  const fieldId = useId();
  const [createError, setCreateError] = useState<unknown>(null);
  const [updateError, setUpdateError] = useState<unknown>(null);
  const [adding, setAdding] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm<GroupUpdateFormValues>({
    resolver: zodResolver(groupUpdateSchema),
    defaultValues: { heading: group.heading ?? "" },
  });

  const bulletCount = group.bullets.length;

  return (
    <AccordionItem value={group.id}>
      <AccordionTrigger>
        <span className="flex min-w-0 flex-col gap-1">
          <span className="truncate">
            {group.heading ?? (
              <span className="text-slate-500 italic dark:text-slate-400">Untitled group</span>
            )}
          </span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            {bulletCount} {bulletCount === 1 ? "bullet" : "bullets"} · {group.id}
          </span>
        </span>
      </AccordionTrigger>

      <AccordionContent className="space-y-6 pt-4">
        <form
          onSubmit={handleSubmit(async (values) => {
            setUpdateError(null);
            try {
              await onUpdateGroup({
                heading: values.heading.trim() ? values.heading.trim() : undefined,
              });
            } catch (err) {
              setUpdateError(err);
            }
          })}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-[1fr_auto]">
            <FormField
              label="Group heading"
              htmlFor={`${fieldId}-heading`}
              hint="Optional — shown above this group's bullets on the resume."
            >
              <Input
                id={`${fieldId}-heading`}
                placeholder="e.g. Platform modernisation"
                {...register("heading")}
              />
            </FormField>
            <Button type="submit" variant="outline" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? "Saving…" : "Save heading"}
            </Button>
          </div>
          <ErrorMessage error={updateError} />
        </form>

        <div className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h4 className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Accomplishments
              </h4>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {bulletCount} {bulletCount === 1 ? "bullet" : "bullets"} in this group
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-expanded={adding}
              onClick={() => setAdding((v) => !v)}
            >
              <Plus aria-hidden="true" className="size-3.5" />
              Add bullet
            </Button>
          </div>

          {bulletCount > 0 && (
            <ul className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
              {group.bullets.map((bullet) => (
                <BulletRow
                  key={bullet.id}
                  bullet={bullet}
                  onUpdate={(body) => onUpdateBullet(bullet.id, body)}
                  onDelete={() => onDeleteBullet(bullet.id)}
                />
              ))}
            </ul>
          )}

          {adding && (
            <BulletCreateForm
              error={createError}
              onCancel={() => setAdding(false)}
              onSubmit={async (values) => {
                setCreateError(null);
                try {
                  await onCreateBullet(values);
                  setAdding(false);
                } catch (err) {
                  setCreateError(err);
                  throw err;
                }
              }}
            />
          )}
        </div>

        <div className="flex justify-end border-t border-slate-200 pt-4 dark:border-slate-800">
          <ConfirmDeleteButton
            label={`group ${group.heading ?? group.id}`}
            onConfirm={onDeleteGroup}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
