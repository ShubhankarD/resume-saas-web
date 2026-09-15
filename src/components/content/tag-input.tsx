"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

/**
 * Tag-chip input for a bullet's `tags: string[]` (app/schemas/content.py's
 * BulletCreate/BulletUpdate). Typing a value and pressing Enter or "," adds
 * it as a chip; clicking a chip's X removes it. Deliberately not a
 * comma-separated free-text field — the backend stores tags as a real list
 * and a chip UI makes duplicates/whitespace visible immediately.
 */
export function TagInput({
  value,
  onChange,
  disabled,
  id,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
  /** Applied to the draft input so a `<label htmlFor>` can point at it. */
  id?: string;
}) {
  const [draft, setDraft] = useState("");

  function commitDraft() {
    const tag = draft.trim();
    setDraft("");
    if (!tag) return;
    if (value.includes(tag)) return;
    onChange([...value, tag]);
  }

  return (
    <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 p-2 transition-colors duration-150 focus-within:border-amber-500 focus-within:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:focus-within:bg-slate-900">
      {value.map((tag) => (
        <Badge key={tag} variant="secondary" className="h-7 gap-1 pr-1.5 pl-2.5">
          {tag}
          {!disabled && (
            <button
              type="button"
              aria-label={`Remove tag ${tag}`}
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="focus-visible:ring-ring/50 inline-flex size-5 items-center justify-center rounded-full text-blue-700/70 transition-colors duration-150 outline-none hover:bg-blue-100 hover:text-red-600 focus-visible:ring-2 dark:text-blue-300/70 dark:hover:bg-blue-900/60 dark:hover:text-red-400"
            >
              <X aria-hidden="true" className="size-3" />
            </button>
          )}
        </Badge>
      ))}
      {!disabled && (
        <Input
          id={id}
          value={draft}
          onChange={(e) => {
            const next = e.target.value;
            if (next.endsWith(",")) {
              setDraft(next.slice(0, -1));
              commitDraft();
              return;
            }
            setDraft(next);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitDraft();
            } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={commitDraft}
          placeholder={value.length === 0 ? "Add a tag, then press Enter" : "Add tag…"}
          className="h-8 min-w-40 flex-1 border-0 bg-transparent px-2 text-sm focus:bg-transparent focus:ring-0 dark:focus:bg-transparent"
        />
      )}
    </div>
  );
}
