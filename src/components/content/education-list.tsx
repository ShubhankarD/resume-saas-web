"use client";

import { GraduationCap, Plus } from "lucide-react";
import { useEducationMutations } from "@/hooks/use-content";
import type { ContentIn } from "@/lib/api/content";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { EducationRow } from "@/components/content/education-row";

/** The education rows, or the empty state when there are none. */
export function EducationList({
  education,
  onAdd,
}: {
  education: ContentIn["education"];
  onAdd: () => void;
}) {
  const { upsert, remove } = useEducationMutations();

  if (education.length === 0) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="No education added yet"
        description="Add a degree, bootcamp, or certification to make it available to a resume."
        action={
          <Button variant="cta" onClick={onAdd}>
            <Plus aria-hidden="true" className="size-4" />
            Add your first entry
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {education.map((entry) => (
        <EducationRow
          key={entry.id}
          id={entry.id}
          text={entry.text}
          onSave={(text) => upsert.mutateAsync({ id: entry.id, text })}
          onDelete={() => remove.mutate(entry.id)}
        />
      ))}
    </div>
  );
}
