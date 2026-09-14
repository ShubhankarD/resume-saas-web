"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProfileWrite } from "@/lib/api/profiles";
import { cn } from "cn";

/**
 * The scalar profile fields — including the two controls the issue calls
 * out as "existing but currently unused": `density` (a tight/relaxed
 * spacing toggle) and `max_pages`. Every input is a live-bound controlled
 * field; the parent editor debounces the resulting draft changes into an
 * autosave + preview refresh (see profiles/[id]/page.tsx), so there is no
 * separate "Save" button here.
 */
export function ProfileBasics({
  draft,
  taglineKeys,
  onChange,
}: {
  draft: ProfileWrite;
  taglineKeys: string[];
  onChange: (patch: Partial<ProfileWrite>) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile basics</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-label">Label</Label>
          <Input
            id="profile-label"
            value={draft.label}
            onChange={(e) => onChange({ label: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-output">Output filename</Label>
          <Input
            id="profile-output"
            placeholder="Jane_Doe_Resume"
            value={draft.output ?? ""}
            onChange={(e) => onChange({ output: e.target.value || null })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-email">Email override</Label>
          <Input
            id="profile-email"
            placeholder="Uses content's default email"
            value={draft.email ?? ""}
            onChange={(e) => onChange({ email: e.target.value || null })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-max-pages">Max pages</Label>
          <Input
            id="profile-max-pages"
            type="number"
            min={1}
            max={10}
            value={draft.max_pages}
            onChange={(e) => onChange({ max_pages: Math.max(1, Number(e.target.value) || 1) })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-tagline">Tagline</Label>
          <select
            id="profile-tagline"
            className="border-border bg-background h-8 rounded-lg border px-2 text-sm"
            value={draft.tagline}
            onChange={(e) => onChange({ tagline: e.target.value })}
          >
            {taglineKeys.length === 0 && <option value={draft.tagline}>{draft.tagline}</option>}
            {taglineKeys.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-tagline-override">Tagline override (optional)</Label>
          <Input
            id="profile-tagline-override"
            placeholder="Overrides the selected tagline's text"
            value={draft.tagline_override ?? ""}
            onChange={(e) => onChange({ tagline_override: e.target.value || null })}
          />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label>Density</Label>
          <div
            className="border-border bg-muted inline-flex w-fit rounded-lg border p-0.5"
            role="radiogroup"
            aria-label="Density"
          >
            {(["tight", "relaxed"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={draft.density === value}
                data-testid={`density-${value}`}
                onClick={() => onChange({ density: value })}
                className={cn(
                  "rounded-[calc(var(--radius-md)-2px)] px-3 py-1 text-sm capitalize transition-colors",
                  draft.density === value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
