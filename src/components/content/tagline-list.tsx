"use client";

import { useMemo } from "react";
import { Plus, Quote } from "lucide-react";
import { useTaglineMutations } from "@/hooks/use-content";
import { useProfiles } from "@/hooks/use-profiles";
import type { ContentIn } from "@/lib/api/content";
import { tallyTaglineUsage } from "@/lib/domain/taglines";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TaglineRow } from "@/components/content/tagline-row";

/** The tagline rows, or the empty state when there are none. */
export function TaglineList({
  taglines,
  onAdd,
}: {
  taglines: ContentIn["taglines"];
  onAdd: () => void;
}) {
  // Already-cached list query. If profiles haven't loaded, the usage count is
  // simply omitted rather than shown as zero.
  const { data: profiles } = useProfiles();
  const { upsert, remove } = useTaglineMutations();
  const usageByKey = useMemo(() => tallyTaglineUsage(profiles ?? []), [profiles]);

  const entries = Object.entries(taglines);

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={Quote}
        title="No taglines yet"
        description="A tagline is the one-line summary under your name — write a general one, then variants."
        action={
          <Button variant="cta" onClick={onAdd}>
            <Plus aria-hidden="true" className="size-4" />
            Add your first tagline
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {entries.map(([key, text]) => (
        <TaglineRow
          key={key}
          taglineKey={key}
          text={text}
          usedIn={profiles ? (usageByKey.get(key) ?? 0) : undefined}
          onSave={(newText) => upsert.mutateAsync({ key, text: newText })}
          onDelete={() => remove.mutate(key)}
        />
      ))}
    </div>
  );
}
