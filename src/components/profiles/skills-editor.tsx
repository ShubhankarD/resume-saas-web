"use client";

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SortableRow } from "@/components/profiles/sortable-row";
import type { ContentIn } from "@/lib/api/content";
import type { ProfileWrite } from "@/lib/api/profiles";
import { MAX_SKILLS_GROUPS, effectiveSkillsOrder } from "@/lib/profile-draft";

export function SkillsEditor({
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
  const allKeys = Object.keys(content.skills);
  const selected = effectiveSkillsOrder(draft, content);

  function toggle(key: string, checked: boolean) {
    if (checked) {
      if (selected.length >= MAX_SKILLS_GROUPS) return;
      onChange({ skills_order: [...selected, key] });
    } else {
      onChange({ skills_order: selected.filter((k) => k !== key) });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = selected.indexOf(String(active.id));
    const newIndex = selected.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    onChange({ skills_order: arrayMove(selected, oldIndex, newIndex) });
  }

  function setOverride(key: string, field: "label" | "text", value: string) {
    const group = content.skills[key];
    const current = draft.skill_overrides?.[key] ?? { label: group.label, text: group.text };
    const next = { ...current, [field]: value };
    const overrides = { ...(draft.skill_overrides ?? {}) };
    if (next.label === group.label && next.text === group.text) {
      delete overrides[key];
    } else {
      overrides[key] = next;
    }
    onChange({ skill_overrides: overrides });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
        <CardDescription>
          Pick up to {MAX_SKILLS_GROUPS} skill groups and drag to reorder them.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-3">
          {allKeys.map((key) => (
            <label key={key} className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(key)}
                disabled={!selected.includes(key) && selected.length >= MAX_SKILLS_GROUPS}
                onChange={(e) => toggle(key, e.target.checked)}
                data-testid={`skill-include-${key}`}
              />
              {key}
            </label>
          ))}
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={selected} strategy={verticalListSortingStrategy}>
            <ul className="flex flex-col gap-1.5">
              {selected.map((key) => {
                const group = content.skills[key];
                const override = draft.skill_overrides?.[key];
                return (
                  <SortableRow key={key} id={key}>
                    <li className="border-border flex flex-col gap-1 rounded-lg border px-2.5 py-1.5">
                      <div className="flex items-center gap-2">
                        <Input
                          defaultValue={override?.label ?? group?.label ?? key}
                          className="h-7 w-40 text-xs"
                          onBlur={(e) => setOverride(key, "label", e.target.value)}
                        />
                        <span className="text-muted-foreground text-xs">({key})</span>
                      </div>
                      <Input
                        defaultValue={override?.text ?? group?.text ?? ""}
                        className="h-7 text-xs"
                        onBlur={(e) => setOverride(key, "text", e.target.value)}
                      />
                    </li>
                  </SortableRow>
                );
              })}
            </ul>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}
