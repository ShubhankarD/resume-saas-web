"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
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
        <CardDescription>
          How this resume is named and paced. Changes save automatically and refresh the preview.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField
            label="Label"
            htmlFor="profile-label"
            hint="Only you see this — it names the profile in your list."
          >
            <Input
              id="profile-label"
              aria-describedby="profile-label-hint"
              value={draft.label}
              onChange={(e) => onChange({ label: e.target.value })}
            />
          </FormField>

          <FormField
            label="Output filename"
            htmlFor="profile-output"
            hint="Used for the exported PDF."
          >
            <Input
              id="profile-output"
              placeholder="Jane_Doe_Resume"
              aria-describedby="profile-output-hint"
              value={draft.output ?? ""}
              onChange={(e) => onChange({ output: e.target.value || null })}
            />
          </FormField>

          <FormField
            label="Email override"
            htmlFor="profile-email"
            hint="Leave empty to use the email from your content set."
          >
            <Input
              id="profile-email"
              type="email"
              placeholder="you@example.com"
              aria-describedby="profile-email-hint"
              value={draft.email ?? ""}
              onChange={(e) => onChange({ email: e.target.value || null })}
            />
          </FormField>

          <FormField
            label="Max pages"
            htmlFor="profile-max-pages"
            hint="The layout trims content to fit this page count."
          >
            <Input
              id="profile-max-pages"
              type="number"
              min={1}
              max={10}
              aria-describedby="profile-max-pages-hint"
              value={draft.max_pages}
              onChange={(e) => onChange({ max_pages: Math.max(1, Number(e.target.value) || 1) })}
            />
          </FormField>

          <FormField label="Tagline" htmlFor="profile-tagline">
            <select
              id="profile-tagline"
              className="h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm text-slate-900 transition-all duration-150 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-100 dark:focus:bg-slate-900"
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
          </FormField>

          <FormField
            label="Tagline override"
            htmlFor="profile-tagline-override"
            hint="Replaces the selected tagline's text on this resume only."
          >
            <Input
              id="profile-tagline-override"
              placeholder="Product-minded engineer, fintech focus"
              aria-describedby="profile-tagline-override-hint"
              value={draft.tagline_override ?? ""}
              onChange={(e) => onChange({ tagline_override: e.target.value || null })}
            />
          </FormField>
        </div>

        <div>
          <Label id="profile-density-label">Density</Label>
          <div
            className="inline-flex w-fit max-w-full rounded-xl border border-slate-200 bg-slate-100/70 p-1 dark:border-slate-800 dark:bg-slate-800/50"
            role="radiogroup"
            aria-labelledby="profile-density-label"
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
                  "inline-flex min-h-9 items-center rounded-lg px-4 text-sm font-medium capitalize transition-colors duration-150 outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                  draft.density === value
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
                )}
              >
                {value}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Tight fits more on the page; relaxed gives each section more breathing room.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
