"use client";

import { useId, useMemo, useState } from "react";
import { Plus, Search, Wrench } from "lucide-react";
import { useSkillMutations } from "@/hooks/use-content";
import type { ContentIn } from "@/lib/api/content";
import { filterSkillGroups } from "@/lib/domain/skills";
import { pluralize } from "@/lib/domain/plural";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { SkillRow } from "@/components/content/skill-row";

/** The searchable list of skill groups, or the empty state when there are none. */
export function SkillGroups({ skills, onAdd }: { skills: ContentIn["skills"]; onAdd: () => void }) {
  const searchId = useId();
  const [search, setSearch] = useState("");
  const { upsert, remove } = useSkillMutations();

  const entries = useMemo(() => Object.entries(skills), [skills]);
  const filtered = useMemo(() => filterSkillGroups(entries, search), [entries, search]);

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={Wrench}
        title="No skill groups yet"
        description="Group related skills under a label so a resume can show the ones that fit the job."
        action={
          <Button variant="cta" onClick={onAdd}>
            <Plus aria-hidden="true" className="size-4" />
            Add your first group
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <label htmlFor={searchId} className="sr-only">
            Search skills
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <Input
            id={searchId}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills…"
            className="pl-9"
          />
        </div>
        <p aria-live="polite" className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
          {filtered.length} of {pluralize(entries.length, "group")}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No matching skill groups"
          description="Nothing here matches that search — try a shorter term."
          action={
            <Button variant="outline" size="sm" onClick={() => setSearch("")}>
              Clear search
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(([key, group]) => (
            <SkillRow
              key={key}
              skillKey={key}
              label={group.label}
              text={group.text}
              onSave={(values) => upsert.mutateAsync({ key, ...values })}
              onDelete={() => remove.mutate(key)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
