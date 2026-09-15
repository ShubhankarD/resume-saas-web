"use client";

import { useMemo, useState } from "react";
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
import { Search, Sparkle } from "lucide-react";
import { EditorCard } from "@/components/ui/editor-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/page-header";
import { Textarea } from "@/components/ui/textarea";
import { SortableGrip, SortableRow } from "@/components/profiles/sortable-row";
import type { ContentIn } from "@/lib/api/content";
import type { ProfileWrite } from "@/lib/api/profiles";
import { MAX_SKILLS_GROUPS, effectiveSkillsOrder } from "@/lib/profile-draft";

const checkboxClassName =
  "size-4 shrink-0 cursor-pointer rounded-sm border-slate-300 accent-slate-900 outline-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:accent-slate-100";

const overlineClassName =
  "text-[11px] font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400";

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

  /**
   * Purely client-side filtering of the already-loaded groups waiting to be
   * added — no extra request, and it deliberately does not touch the ordered
   * list above so drag-reordering always sees every selected group.
   */
  const [query, setQuery] = useState("");
  const filteredAvailable = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return available;
    return available.filter((key) => {
      const group = content.skills[key];
      return `${key} ${group?.label ?? ""} ${group?.text ?? ""}`.toLowerCase().includes(needle);
    });
  }, [available, content.skills, query]);

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
    <section className="space-y-6">
      <SectionHeader
        title="Skills"
        description={`Pick up to ${MAX_SKILLS_GROUPS} groups, drag them into order, and reword any group for this resume.`}
        action={
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {selected.length} of {MAX_SKILLS_GROUPS} selected
          </span>
        }
      />

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
                <div className="space-y-2">
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
                            <label className="inline-flex h-8 cursor-pointer items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
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
            <div className="space-y-2 border-t border-slate-200 pt-4 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className={overlineClassName}>Not included ({available.length})</p>

                {available.length > 4 && (
                  <div className="relative w-full sm:w-56">
                    <Search
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                    />
                    <label htmlFor="skills-filter" className="sr-only">
                      Search skill groups
                    </label>
                    <Input
                      id="skills-filter"
                      type="search"
                      placeholder="Search groups…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="h-8 pl-8"
                    />
                  </div>
                )}
              </div>

              {atLimit && (
                <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                  You have reached the limit of {MAX_SKILLS_GROUPS} groups. Remove one to add
                  another.
                </p>
              )}

              {filteredAvailable.length === 0 ? (
                <p className="px-2 py-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  No groups match “{query.trim()}”.
                </p>
              ) : (
                <ul className="space-y-0.5">
                  {filteredAvailable.map((key) => {
                    const group = content.skills[key];
                    return (
                      <li key={key} className="list-none">
                        <label
                          className={`flex items-start gap-2.5 rounded-md px-2 py-2 transition-colors duration-150 ${
                            atLimit
                              ? "cursor-not-allowed opacity-60"
                              : "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className={`${checkboxClassName} mt-0.5`}
                            checked={false}
                            disabled={atLimit}
                            onChange={(e) => toggle(key, e.target.checked)}
                            aria-label={`Include ${group?.label ?? key} on this resume`}
                            data-testid={`skill-include-${key}`}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                              {group?.label ?? key}
                            </span>
                            {group?.text && (
                              <span className="mt-0.5 block truncate text-xs leading-5 text-slate-500 dark:text-slate-400">
                                {group.text}
                              </span>
                            )}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
