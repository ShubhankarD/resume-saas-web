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
import { Sparkle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EditorCard } from "@/components/ui/editor-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SortableGrip, SortableRow } from "@/components/profiles/sortable-row";
import type { ContentIn } from "@/lib/api/content";
import type { ProfileWrite } from "@/lib/api/profiles";
import { MAX_SKILLS_GROUPS, effectiveSkillsOrder } from "@/lib/profile-draft";

const checkboxClassName =
  "size-4 shrink-0 cursor-pointer rounded-sm border-slate-300 accent-slate-900 outline-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:accent-slate-100";

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
  const available = allKeys.filter((key) => !selected.includes(key));
  const atLimit = selected.length >= MAX_SKILLS_GROUPS;

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
          Pick up to {MAX_SKILLS_GROUPS} skill groups, drag them into order, and reword any group
          for this resume. {selected.length} of {MAX_SKILLS_GROUPS} selected.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {allKeys.length === 0 ? (
          <EmptyState
            icon={Sparkle}
            title="No skill groups yet"
            description="Add skill groups in the content editor — languages, tools, domains — and they will show up here."
          />
        ) : (
          <>
            {selected.length === 0 ? (
              <EmptyState
                icon={Sparkle}
                title="No skills on this resume"
                description="Pick a group below to add a skills section to this profile."
              />
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={selected} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {selected.map((key) => {
                      const group = content.skills[key];
                      const override = draft.skill_overrides?.[key];
                      const label = override?.label ?? group?.label ?? key;
                      const text = override?.text ?? group?.text ?? "";
                      return (
                        <SortableRow key={key} id={key}>
                          <EditorCard
                            title={label}
                            subtitle={text || undefined}
                            meta={key}
                            dragHandle={<SortableGrip label={`Reorder ${label}`} />}
                            actions={
                              <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                                <input
                                  type="checkbox"
                                  className={checkboxClassName}
                                  checked
                                  onChange={(e) => toggle(key, e.target.checked)}
                                  aria-label={`Include ${label} on this resume`}
                                  data-testid={`skill-include-${key}`}
                                />
                                <span className="hidden sm:inline">Included</span>
                              </label>
                            }
                          >
                            <FormField label="Group label" htmlFor={`skill-label-${key}`}>
                              <Input
                                id={`skill-label-${key}`}
                                defaultValue={label}
                                onBlur={(e) => setOverride(key, "label", e.target.value)}
                              />
                            </FormField>

                            <FormField
                              label="Skills"
                              htmlFor={`skill-text-${key}`}
                              hint="Shown as a single line on the resume — keep it scannable."
                            >
                              <Textarea
                                id={`skill-text-${key}`}
                                defaultValue={text}
                                aria-describedby={`skill-text-${key}-hint`}
                                className="min-h-[72px]"
                                onBlur={(e) => setOverride(key, "text", e.target.value)}
                              />
                            </FormField>
                          </EditorCard>
                        </SortableRow>
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {available.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                  Not included
                </p>
                {atLimit && (
                  <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    You have reached the limit of {MAX_SKILLS_GROUPS} groups. Remove one to add
                    another.
                  </p>
                )}
                <ul className="space-y-2">
                  {available.map((key) => {
                    const group = content.skills[key];
                    return (
                      <li
                        key={key}
                        className="flex items-start gap-2.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/40"
                      >
                        <span className="inline-flex min-h-9 items-center">
                          <input
                            type="checkbox"
                            className={checkboxClassName}
                            checked={false}
                            disabled={atLimit}
                            onChange={(e) => toggle(key, e.target.checked)}
                            aria-label={`Include ${group?.label ?? key} on this resume`}
                            data-testid={`skill-include-${key}`}
                          />
                        </span>
                        <span className="min-w-0 flex-1 py-1.5">
                          <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            {group?.label ?? key}
                          </span>
                          {group?.text && (
                            <span className="mt-0.5 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                              {group.text}
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
