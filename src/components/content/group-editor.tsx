"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ConfirmDeleteButton } from "@/components/content/confirm-delete-button";
import { BulletRow } from "@/components/content/bullet-row";
import { BulletCreateForm } from "@/components/content/bullet-create-form";
import { GroupHeadingForm } from "@/components/content/group-heading-form";
import { useGroupActions } from "@/hooks/use-content";
import type { GroupIn } from "@/lib/api/content";

/**
 * One bullet group inside a role, rendered as a collapsible section rather
 * than a card of its own — the role already provides the card surface, and
 * nesting cards inside cards is what made this editor feel like an admin
 * tool. Must be rendered inside an `<Accordion>`.
 */
export function GroupEditor({ roleId, group }: { roleId: string; group: GroupIn }) {
  const actions = useGroupActions(roleId, group.id);
  const [adding, setAdding] = useState(false);
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
        <GroupHeadingForm
          heading={group.heading}
          onSave={(heading) => actions.update.mutateAsync({ heading })}
          error={actions.update.error}
        />

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
                  onUpdate={(body) =>
                    actions.updateBullet.mutateAsync({ bulletId: bullet.id, body })
                  }
                  onDelete={() => actions.removeBullet.mutate(bullet.id)}
                />
              ))}
            </ul>
          )}

          {adding && (
            <BulletCreateForm
              error={actions.createBullet.error}
              onCancel={() => setAdding(false)}
              onSubmit={async (values) => {
                await actions.createBullet.mutateAsync(values);
                setAdding(false);
              }}
            />
          )}
        </div>

        <div className="flex justify-end border-t border-slate-200 pt-4 dark:border-slate-800">
          <ConfirmDeleteButton
            label={`group ${group.heading ?? group.id}`}
            onConfirm={() => actions.remove.mutate()}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
