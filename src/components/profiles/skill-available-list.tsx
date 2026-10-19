"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { filterSkillGroups } from "@/lib/domain/skills";
import { CHECKBOX_CLASS, OVERLINE_CLASS } from "@/components/profiles/editor-styles";

interface AvailableSkill {
  key: string;
  label: string;
  text: string;
}

/** Skill groups not on the resume yet, with a client-side filter over the
 * already-loaded groups (it never touches the ordered list above, so
 * drag-reordering always sees every selected group). */
export function SkillAvailableList({
  skills,
  atLimit,
  maxGroups,
  onInclude,
}: {
  skills: readonly AvailableSkill[];
  atLimit: boolean;
  maxGroups: number;
  onInclude: (key: string) => void;
}) {
  const [query, setQuery] = useState("");
  const visible = useMemo(
    () =>
      filterSkillGroups(
        skills.map((s) => [s.key, s] as const),
        query,
      ).map(([, skill]) => skill),
    [skills, query],
  );

  return (
    <div className="space-y-2 border-t border-slate-200 pt-4 dark:border-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={OVERLINE_CLASS}>Not included ({skills.length})</p>

        {skills.length > 4 && (
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
          You have reached the limit of {maxGroups} groups. Remove one to add another.
        </p>
      )}

      {visible.length === 0 ? (
        <p className="px-2 py-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          No groups match “{query.trim()}”.
        </p>
      ) : (
        <ul className="space-y-0.5">
          {visible.map(({ key, label, text }) => (
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
                  className={`${CHECKBOX_CLASS} mt-0.5`}
                  checked={false}
                  disabled={atLimit}
                  onChange={() => onInclude(key)}
                  aria-label={`Include ${label} on this resume`}
                  data-testid={`skill-include-${key}`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {label}
                  </span>
                  {text && (
                    <span className="mt-0.5 block truncate text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {text}
                    </span>
                  )}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
