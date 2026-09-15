"use client";

import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Briefcase, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EditorCard } from "@/components/ui/editor-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/page-header";
import { AI_BULLET_ACTIONS, AiActionChip } from "@/components/ui/ai-action-chip";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SortableGrip, SortableRow } from "@/components/profiles/sortable-row";
import type { ContentIn } from "@/lib/api/content";
import type { ProfileWrite } from "@/lib/api/profiles";
import {
  effectiveRoleOrder,
  groupOrderForRole,
  rebuildGroupsOrder,
  selectedBulletIds,
} from "@/lib/profile-draft";
import { cn } from "cn";

type RoleIn = ContentIn["experience"][number];
type GroupIn = RoleIn["groups"][number];

/** Shared checkbox treatment for the include/exclude controls. */
const checkboxClassName =
  "size-4 shrink-0 cursor-pointer rounded-sm border-slate-300 accent-slate-900 outline-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed dark:border-slate-600 dark:accent-slate-100";

/** Section overline used above the excluded-bullet lists. */
const overlineClassName =
  "text-[11px] font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400";

/**
 * Drag-and-drop id scheme: since roles/groups/bullets are three logically
 * independent (never dragged into each other) reorderable lists nested
 * inside one another in the DOM, this uses ONE shared `DndContext` (as
 * `@dnd-kit`'s own multi-container examples recommend — nesting several
 * independent `DndContext`s causes their pointer sensors to fight over the
 * same events) with composite, prefixed sortable ids so `handleDragEnd` can
 * tell which list moved: `role:<roleId>`, `group:<roleId>:<groupId>`,
 * `bullet:<roleId>:<groupId>:<bulletId>`.
 */
export function ExperienceEditor({
  content,
  draft,
  onChange,
}: {
  content: ContentIn;
  draft: ProfileWrite;
  onChange: (patch: Partial<ProfileWrite>) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const roleOrder = effectiveRoleOrder(draft, content);
  const rolesById = new Map(content.experience.map((r) => [r.id, r]));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const [kind] = activeId.split(":");

    if (kind === "role") {
      const oldIndex = roleOrder.indexOf(activeId.split(":")[1]);
      const newIndex = roleOrder.indexOf(overId.split(":")[1]);
      if (oldIndex === -1 || newIndex === -1) return;
      onChange({ experience: arrayMove(roleOrder, oldIndex, newIndex) });
      return;
    }

    if (kind === "group") {
      const [, roleId, groupId] = activeId.split(":");
      const [, overRoleId, overGroupId] = overId.split(":");
      if (roleId !== overRoleId) return; // groups only reorder within their own role
      const current = groupOrderForRole(draft, content, roleId);
      const oldIndex = current.indexOf(groupId);
      const newIndex = current.indexOf(overGroupId);
      if (oldIndex === -1 || newIndex === -1) return;
      const newOrder = arrayMove(current, oldIndex, newIndex);
      onChange({ groups_order: rebuildGroupsOrder(draft, content, roleId, newOrder) });
      return;
    }

    if (kind === "bullet") {
      const [, roleId, groupId, bulletId] = activeId.split(":");
      const [, overRoleId, overGroupId, overBulletId] = overId.split(":");
      if (roleId !== overRoleId || groupId !== overGroupId) return;
      const current = selectedBulletIds(draft, content, groupId);
      const oldIndex = current.indexOf(bulletId);
      const newIndex = current.indexOf(overBulletId);
      if (oldIndex === -1 || newIndex === -1) return;
      const newOrder = arrayMove(current, oldIndex, newIndex);
      onChange({ bullets: { ...(draft.bullets ?? {}), [groupId]: newOrder } });
    }
  }

  const visibleRoles = roleOrder
    .map((roleId) => rolesById.get(roleId))
    .filter((role): role is RoleIn => role !== undefined);

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Experience"
        description="Drag a grip to reorder roles, groups, and bullets. Clear a checkbox to leave that bullet — or a whole group — off this resume."
      />

      {visibleRoles.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No experience yet"
          description="Add roles, internships, or projects in the content editor, then choose what belongs on this resume."
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={visibleRoles.map((role) => `role:${role.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {visibleRoles.map((role) => (
                <RoleCard
                  key={`role:${role.id}`}
                  role={role}
                  content={content}
                  draft={draft}
                  onChange={onChange}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
}

function RoleCard({
  role,
  content,
  draft,
  onChange,
}: {
  role: RoleIn;
  content: ContentIn;
  draft: ProfileWrite;
  onChange: (patch: Partial<ProfileWrite>) => void;
}) {
  const groupIds = groupOrderForRole(draft, content, role.id);
  const includedBullets = groupIds.reduce(
    (total, groupId) => total + selectedBulletIds(draft, content, groupId).length,
    0,
  );

  // `RoleIn` has no location field and `dates` is one freeform string, so the
  // collapsed row reads "<org> · <dates>" rather than inventing sub-fields.
  const summary = [role.org].filter(Boolean).join(" · ");

  return (
    <SortableRow id={`role:${role.id}`}>
      <EditorCard
        title={role.title || role.id}
        subtitle={summary || undefined}
        meta={role.dates || undefined}
        defaultOpen
        dragHandle={<SortableGrip label={`Reorder ${role.title || role.id}`} />}
        actions={
          <Badge variant={includedBullets > 0 ? "secondary" : "outline"}>
            {includedBullets} {includedBullets === 1 ? "bullet" : "bullets"}
          </Badge>
        }
      >
        {groupIds.length === 0 ? (
          <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
            This role has no bullet groups yet.
          </p>
        ) : (
          <SortableContext
            items={groupIds.map((groupId) => `group:${role.id}:${groupId}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-5">
              {groupIds.map((groupId) => {
                const group = (role.groups ?? []).find((g) => g.id === groupId);
                if (!group) return null;
                return (
                  <GroupBlock
                    key={`group:${role.id}:${groupId}`}
                    roleId={role.id}
                    group={group}
                    draft={draft}
                    onChange={onChange}
                  />
                );
              })}
            </div>
          </SortableContext>
        )}
      </EditorCard>
    </SortableRow>
  );
}

/**
 * A bullet group inside a role. Deliberately *not* a card: the blueprint
 * forbids nesting cards inside editor cards, so a group is a header row plus
 * an indented body, and the only border level below the role card is the one
 * around each included-bullet row.
 */
function GroupBlock({
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

  function toggleBullet(bulletId: string, checked: boolean) {
    const base = selected ?? allBulletIds;
    if (checked) {
      // Re-insert at its natural content position among the currently selected.
      const withAdded = allBulletIds.filter((id) => base.includes(id) || id === bulletId);
      setSelected(withAdded);
    } else {
      setSelected(base.filter((id) => id !== bulletId));
    }
  }

  function toggleGroup(checked: boolean) {
    setSelected(checked ? allBulletIds : []);
  }

  function setHeadingOverride(value: string) {
    const next = { ...(draft.headings ?? {}) };
    if (value.trim() === "" || value === group.heading) {
      delete next[group.id];
    } else {
      next[group.id] = value;
    }
    onChange({ headings: next });
  }

  return (
    <SortableRow id={`group:${roleId}:${group.id}`}>
      <div className={cn("space-y-2.5", !groupIncluded && "opacity-75")}>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <SortableGrip label={`Reorder group ${heading || group.id}`} className="-ml-1.5" />

          <input
            type="checkbox"
            className={checkboxClassName}
            checked={groupIncluded}
            onChange={(e) => toggleGroup(e.target.checked)}
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
                setHeadingOverride(e.target.value);
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

          {!groupIncluded && <span className={cn(overlineClassName, "shrink-0")}>Hidden</span>}

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
                items={orderedSelected.map((bid) => `bullet:${roleId}:${group.id}:${bid}`)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-2">
                  {orderedSelected.map((bulletId, index) => {
                    const bullet = bullets.find((b) => b.id === bulletId);
                    if (!bullet) return null;
                    return (
                      <li key={bulletId} className="list-none">
                        <SortableRow id={`bullet:${roleId}:${group.id}:${bulletId}`}>
                          <IncludedBullet
                            bullet={bullet}
                            position={index + 1}
                            overrideText={draft.bullet_overrides?.[bullet.id]}
                            onExclude={() => toggleBullet(bullet.id, false)}
                            onOverride={(value) => {
                              const next = { ...(draft.bullet_overrides ?? {}) };
                              if (value === bullet.text || value.trim() === "") {
                                delete next[bullet.id];
                              } else {
                                next[bullet.id] = value;
                              }
                              onChange({ bullet_overrides: next });
                            }}
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
                <p className={overlineClassName}>Not included ({excludedBullets.length})</p>
                <ul className="space-y-0.5">
                  {excludedBullets.map((bullet) => (
                    <li key={bullet.id} className="list-none">
                      <label className="flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-2 transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/60">
                        <input
                          type="checkbox"
                          className={cn(checkboxClassName, "mt-0.5")}
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

function IncludedBullet({
  bullet,
  position,
  overrideText,
  onExclude,
  onOverride,
}: {
  bullet: GroupIn["bullets"][number];
  position: number;
  overrideText: string | undefined;
  onExclude: () => void;
  onOverride: (value: string) => void;
}) {
  const textareaId = `bullet-text-${bullet.id}`;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 transition-colors duration-150 hover:border-slate-300 sm:p-4 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        <SortableGrip label={`Reorder bullet ${position}`} className="-ml-1.5" />

        <label className="inline-flex h-8 cursor-pointer items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            className={checkboxClassName}
            checked
            onChange={onExclude}
            aria-label={`Include bullet ${bullet.id}`}
          />
          Included
        </label>

        {(bullet.tags.length > 0 || bullet.variant_group) && (
          <div className="ml-auto flex flex-wrap justify-end gap-1.5">
            {bullet.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
            {bullet.variant_group && (
              <Badge variant="outline">variant: {bullet.variant_group}</Badge>
            )}
          </div>
        )}
      </div>

      <label htmlFor={textareaId} className="sr-only">
        Bullet text
      </label>
      <Textarea
        id={textareaId}
        defaultValue={overrideText ?? bullet.text}
        className="min-h-[72px]"
        onBlur={(e) => onOverride(e.target.value)}
      />

      {/*
        Presentational only: there is no AI bullet-rewrite endpoint yet, so these
        chips deliberately make no request. TODO: wire each chip's onClick to an
        `onAiAction(bullet.id, action.id)` handler once a rewrite endpoint and its
        React Query mutation hook exist.
      */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {AI_BULLET_ACTIONS.map((action) => (
          <span key={action.id} title="AI rewrite suggestions are coming soon">
            <AiActionChip label={action.label} disabled className="h-7" />
          </span>
        ))}
      </div>
    </div>
  );
}
