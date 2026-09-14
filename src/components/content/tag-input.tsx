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
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
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
    <div className="flex flex-wrap items-center gap-1.5">
      {value.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1">
          {tag}
          {!disabled && (
            <button
              type="button"
              aria-label={`Remove tag ${tag}`}
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="hover:text-destructive"
            >
              <X className="size-3" />
            </button>
          )}
        </Badge>
      ))}
      {!disabled && (
        <Input
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
          placeholder="Add tag…"
          className="h-6 w-28 px-1.5 text-xs"
        />
      )}
    </div>
  );
}
