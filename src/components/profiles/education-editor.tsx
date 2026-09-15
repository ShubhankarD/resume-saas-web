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
import { GraduationCap } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/page-header";
import { SortableGrip, SortableRow } from "@/components/profiles/sortable-row";
import type { ContentIn } from "@/lib/api/content";
import type { ProfileWrite } from "@/lib/api/profiles";
import { effectiveEducationOrder } from "@/lib/profile-draft";

const checkboxClassName =
  "size-4 shrink-0 cursor-pointer rounded-sm border-slate-300 accent-slate-900 outline-none focus-visible:ring-3 focus-visible:ring-ring/40 dark:border-slate-600 dark:accent-slate-100";

const overlineClassName =
  "text-[11px] font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400";

/**
 * `EducationEntryIn` is flat `{id, text}` — there is no degree/school/date
 * split to lay out — so an included entry is a single compact row: grip,
 * text, include checkbox.
 */
export function EducationEditor({
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
  const selected = effectiveEducationOrder(draft, content);
  const byId = new Map(content.education.map((e) => [e.id, e]));
  const available = content.education.filter((entry) => !selected.includes(entry.id));

  function toggle(id: string, checked: boolean) {
    onChange({
      education: checked ? [...selected, id] : selected.filter((eid) => eid !== id),
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = selected.indexOf(String(active.id));
    const newIndex = selected.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    onChange({ education: arrayMove(selected, oldIndex, newIndex) });
  }

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Education"
        description="Choose which entries appear on this resume and drag them into the order you want."
      />

      {content.education.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No education yet"
          description="Add degrees, certifications, or coursework in the content editor to use them here."
        />
      ) : (
        <>
          {selected.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No education on this resume"
              description="Pick an entry below to add it back to this profile."
            />
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={selected} strategy={verticalListSortingStrategy}>
                <ul className="space-y-2">
                  {selected.map((id, index) => {
                    const entry = byId.get(id);
                    return (
                      <li key={id} className="list-none">
                        <SortableRow id={id}>
                          <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3 transition-colors duration-150 hover:border-slate-300 sm:gap-3 sm:p-4 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
                            <SortableGrip
                              label={`Reorder education entry ${index + 1}`}
                              className="-ml-1"
                            />
                            <p className="min-w-0 flex-1 py-1.5 text-sm leading-6 text-slate-900 dark:text-slate-100">
                              {entry?.text ?? id}
                            </p>
                            <span className="inline-flex h-8 shrink-0 items-center">
                              <input
                                type="checkbox"
                                className={checkboxClassName}
                                checked
                                onChange={() => toggle(id, false)}
                                aria-label={`Include ${entry?.text ?? id}`}
                                data-testid={`education-include-${id}`}
                              />
                            </span>
                          </div>
                        </SortableRow>
                      </li>
                    );
                  })}
                </ul>
              </SortableContext>
            </DndContext>
          )}

          {available.length > 0 && (
            <div className="space-y-1.5 border-t border-slate-200 pt-4 dark:border-slate-800">
              <p className={overlineClassName}>Not included ({available.length})</p>
              <ul className="space-y-0.5">
                {available.map((entry) => (
                  <li key={entry.id} className="list-none">
                    <label className="flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-2 transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/60">
                      <input
                        type="checkbox"
                        className={`${checkboxClassName} mt-0.5`}
                        checked={false}
                        onChange={() => toggle(entry.id, true)}
                        aria-label={`Include ${entry.text || entry.id}`}
                        data-testid={`education-include-${entry.id}`}
                      />
                      <span className="min-w-0 flex-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {entry.text || entry.id}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
