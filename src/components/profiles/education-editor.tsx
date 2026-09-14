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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SortableRow } from "@/components/profiles/sortable-row";
import type { ContentIn } from "@/lib/api/content";
import type { ProfileWrite } from "@/lib/api/profiles";
import { effectiveEducationOrder } from "@/lib/profile-draft";

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
  const allIds = content.education.map((e) => e.id);
  const selected = effectiveEducationOrder(draft, content);
  const byId = new Map(content.education.map((e) => [e.id, e]));

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
    <Card>
      <CardHeader>
        <CardTitle>Education</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-3">
          {allIds.map((id) => (
            <label key={id} className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(id)}
                onChange={(e) => toggle(id, e.target.checked)}
                data-testid={`education-include-${id}`}
              />
              {byId.get(id)?.text ?? id}
            </label>
          ))}
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={selected} strategy={verticalListSortingStrategy}>
            <ul className="flex flex-col gap-1.5">
              {selected.map((id) => (
                <SortableRow key={id} id={id}>
                  <li className="border-border rounded-lg border px-2.5 py-1.5 text-sm">
                    {byId.get(id)?.text ?? id}
                  </li>
                </SortableRow>
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}
