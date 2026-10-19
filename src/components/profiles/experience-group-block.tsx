"use client";

import { useState } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { ContentIn } from "@/lib/api/content";
import type { ProfileWrite } from "@/lib/api/profiles";
import { bulletSortableId, groupSortableId } from "@/lib/domain/experience-dnd";
import { withBulletToggled, withTextOverride } from "@/lib/domain/profile-overrides";
import { CHECKBOX_CLASS, OVERLINE_CLASS } from "@/components/profiles/editor-styles";
import { IncludedBullet } from "@/components/profiles/experience-included-bullet";
import { SortableGrip, SortableRow } from "@/components/profiles/sortable-row";
import { cn } from "cn";

type GroupIn = ContentIn["experience"][number]["groups"][number];

/**
 * A bullet group inside a role. Deliberately *not* a card: the blueprint
 * forbids nesting cards inside editor cards, so a group is a header row plus
 * an indented body, and the only border level below the role card is the one
 * around each included-bullet row.
 */
export function GroupBlock({
  roleId,
  group,
  draft,
  onChange,
}: {
  roleId: string;
  group: GroupIn;
  draft: ProfileWrite;
  onChange: (patch: Partial<ProfileWrite>) => void;
}) {
  const [editingHeading, setEditingHeading] = useState(false);
  const selected = draft.bullets?.[group.id];
  const bullets = group.bullets ?? [];
  const allBulletIds = bullets.map((b) => b.id);
  const orderedSelected = selected ?? allBulletIds;
  const groupIncluded = orderedSelected.length > 0;
  const heading = draft.headings?.[group.id] ?? group.heading ?? "";
  const excludedBullets = bullets.filter((b) => !orderedSelected.includes(b.id));

  function setSelected(next: string[]) {
    onChange({ bullets: { ...(draft.bullets ?? {}), [group.id]: next } });
  }

  const toggleBullet = (bulletId: string, checked: boolean) =>
    setSelected(withBulletToggled(selected, allBulletIds, bulletId, checked));

  return (
    <SortableRow id={groupSortableId(roleId, group.id)}>
      <div className={cn("space-y-2.5", !groupIncluded && "opacity-75")}>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <SortableGrip label={`Reorder group ${heading || group.id}`} className="-ml-1.5" />

          <input
            type="checkbox"
            className={CHECKBOX_CLASS}
            checked={groupIncluded}
            onChange={(e) => setSelected(e.target.checked ? allBulletIds : [])}
            aria-label={`Include ${heading || "this group"} in this resume`}
            data-testid={`group-include-${group.id}`}
          />

          {editingHeading ? (
            <Input
              autoFocus
              defaultValue={heading}
              aria-label="Group heading"
              className="h-8 w-56 max-w-full"
              onBlur={(e) => {
                onChange({
                  headings: withTextOverride(
                    draft.headings,
                    group.id,
                    e.target.value,
                    group.heading,
                  ),
                });
                setEditingHeading(false);
              }}
            />
          ) : (
            <button
              type="button"
              className="group/heading focus-visible:ring-ring/40 inline-flex h-8 items-center gap-1.5 rounded-md px-1.5 text-sm font-semibold tracking-tight text-slate-900 transition-colors duration-150 outline-none hover:bg-slate-100 focus-visible:ring-3 dark:text-slate-100 dark:hover:bg-slate-800"
              onClick={() => setEditingHeading(true)}
            >
              {heading || (
                <span className="font-normal text-slate-500 italic dark:text-slate-400">
                  Untitled group
                </span>
              )}
              <Pencil
                aria-hidden="true"
                className="size-3 text-slate-400 opacity-0 transition-opacity duration-150 group-hover/heading:opacity-100 dark:text-slate-500"
              />
              <span className="sr-only">Rename group heading</span>
            </button>
          )}

          {!groupIncluded && <span className={cn(OVERLINE_CLASS, "shrink-0")}>Hidden</span>}

          <span className="ml-auto truncate text-xs text-slate-400 dark:text-slate-500">
            {group.id}
          </span>
        </div>

        {bullets.length === 0 ? (
          <p className="pl-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            This group has no bullets yet.
          </p>
        ) : (
          <div className="space-y-3 pl-2 sm:pl-3.5">
            {orderedSelected.length > 0 && (
              <SortableContext
                items={orderedSelected.map((id) => bulletSortableId(roleId, group.id, id))}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-2">
                  {orderedSelected.map((bulletId, index) => {
                    const bullet = bullets.find((b) => b.id === bulletId);
                    if (!bullet) return null;
                    return (
                      <li key={bulletId} className="list-none">
                        <SortableRow id={bulletSortableId(roleId, group.id, bulletId)}>
                          <IncludedBullet
                            bullet={bullet}
                            position={index + 1}
                            overrideText={draft.bullet_overrides?.[bullet.id]}
                            onExclude={() => toggleBullet(bullet.id, false)}
                            onOverride={(value) =>
                              onChange({
                                bullet_overrides: withTextOverride(
                                  draft.bullet_overrides,
                                  bullet.id,
                                  value,
                                  bullet.text,
                                ),
                              })
                            }
                          />
                        </SortableRow>
                      </li>
                    );
                  })}
                </ul>
              </SortableContext>
            )}

            {excludedBullets.length > 0 && (
              <div className="space-y-1.5 border-t border-slate-200 pt-3 dark:border-slate-800">
                <p className={OVERLINE_CLASS}>Not included ({excludedBullets.length})</p>
                <ul className="space-y-0.5">
                  {excludedBullets.map((bullet) => (
                    <li key={bullet.id} className="list-none">
                      <label className="flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-2 transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/60">
                        <input
                          type="checkbox"
                          className={cn(CHECKBOX_CLASS, "mt-0.5")}
                          checked={false}
                          onChange={() => toggleBullet(bullet.id, true)}
                          aria-label={`Include bullet ${bullet.id}`}
                        />
                        <span className="min-w-0 flex-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                          {bullet.text}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </SortableRow>
  );
}
