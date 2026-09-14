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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SortableRow } from "@/components/profiles/sortable-row";
import type { ContentIn } from "@/lib/api/content";
import type { ProfileWrite } from "@/lib/api/profiles";
import {
  effectiveRoleOrder,
  groupOrderForRole,
  rebuildGroupsOrder,
  selectedBulletIds,
} from "@/lib/profile-draft";

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Experience</CardTitle>
        <CardDescription>
          Drag roles, groups, and bullets to reorder. Uncheck a bullet to leave it out; uncheck
          every bullet in a group to suppress the whole group for this profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={roleOrder.map((id) => `role:${id}`)}
            strategy={verticalListSortingStrategy}
          >
            {roleOrder.map((roleId) => {
              const role = rolesById.get(roleId);
              if (!role) return null;
              return (
                <SortableRow key={`role:${roleId}`} id={`role:${roleId}`} className="mb-3">
                  <div className="border-border rounded-lg border p-3">
                    <p className="font-heading text-sm font-medium">
                      {role.title} <span className="text-muted-foreground font-normal">· {role.org}</span>
                    </p>
                    <p className="text-muted-foreground mb-2 text-xs">{role.dates}</p>
                    <SortableContext
                      items={groupOrderForRole(draft, content, roleId).map(
                        (gid) => `group:${roleId}:${gid}`,
                      )}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex flex-col gap-2">
                        {groupOrderForRole(draft, content, roleId).map((groupId) => {
                          const group = (role.groups ?? []).find((g) => g.id === groupId);
                          if (!group) return null;
                          return (
                            <GroupBlock
                              key={`group:${roleId}:${groupId}`}
                              roleId={roleId}
                              group={group}
                              draft={draft}
                              onChange={onChange}
                            />
                          );
                        })}
                      </div>
                    </SortableContext>
                  </div>
                </SortableRow>
              );
            })}
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}

function GroupBlock({
  roleId,
  group,
  draft,
  onChange,
}: {
  roleId: string;
  group: ContentIn["experience"][number]["groups"][number];
  draft: ProfileWrite;
  onChange: (patch: Partial<ProfileWrite>) => void;
}) {
  const [editingHeading, setEditingHeading] = useState(false);
  const selected = draft.bullets?.[group.id];
  const allBulletIds = (group.bullets ?? []).map((b) => b.id);
  const orderedSelected = selected ?? allBulletIds;
  const groupIncluded = orderedSelected.length > 0;
  const heading = draft.headings?.[group.id] ?? group.heading ?? "";

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
      <div className="bg-muted/30 rounded-lg p-2.5">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={groupIncluded}
              onChange={(e) => toggleGroup(e.target.checked)}
              data-testid={`group-include-${group.id}`}
            />
            {editingHeading ? (
              <Input
                autoFocus
                defaultValue={heading}
                className="h-6 w-48 text-xs"
                onBlur={(e) => {
                  setHeadingOverride(e.target.value);
                  setEditingHeading(false);
                }}
              />
            ) : (
              <button
                type="button"
                className="hover:underline"
                onClick={() => setEditingHeading(true)}
              >
                {heading || <span className="text-muted-foreground italic">Untitled group</span>}
              </button>
            )}
          </label>
          <span className="text-muted-foreground text-xs">({group.id})</span>
        </div>
        {groupIncluded && (
          <SortableContext
            items={orderedSelected.map((bid) => `bullet:${roleId}:${group.id}:${bid}`)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="flex flex-col gap-1.5">
              {orderedSelected.map((bulletId) => {
                  const bullet = (group.bullets ?? []).find((b) => b.id === bulletId);
                  if (!bullet) return null;
                  const overrideText = draft.bullet_overrides?.[bulletId];
                  return (
                    <SortableRow key={bulletId} id={`bullet:${roleId}:${group.id}:${bulletId}`}>
                      <li className="border-border rounded border bg-background px-2 py-1.5">
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked
                            onChange={() => toggleBullet(bulletId, false)}
                            aria-label={`Include bullet ${bulletId}`}
                          />
                          <div className="flex-1">
                            <Textarea
                              defaultValue={overrideText ?? bullet.text}
                              className="min-h-8 text-xs"
                              onBlur={(e) => {
                                const next = { ...(draft.bullet_overrides ?? {}) };
                                if (e.target.value === bullet.text || e.target.value.trim() === "") {
                                  delete next[bulletId];
                                } else {
                                  next[bulletId] = e.target.value;
                                }
                                onChange({ bullet_overrides: next });
                              }}
                            />
                            <div className="mt-1 flex flex-wrap gap-1">
                              {bullet.tags.map((tag) => (
                                <Badge key={tag} variant="secondary">
                                  {tag}
                                </Badge>
                              ))}
                              {bullet.variant_group && (
                                <Badge variant="outline">variant: {bullet.variant_group}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    </SortableRow>
                  );
                })}
              </ul>
          </SortableContext>
        )}
        {!groupIncluded && (
          <div className="flex flex-wrap gap-1.5 pl-6">
            {allBulletIds.map((bulletId) => (
              <label key={bulletId} className="flex items-center gap-1 text-xs">
                <input type="checkbox" checked={false} onChange={() => toggleBullet(bulletId, true)} />
                {bulletId}
              </label>
            ))}
          </div>
        )}
      </div>
    </SortableRow>
  );
}
