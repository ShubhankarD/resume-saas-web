"use client";

import { Check, LayoutTemplate } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/content/error-message";
import { useTemplates } from "@/hooks/use-templates";
import { cn } from "cn";

/**
 * GET /api/v1/templates/ has no server-side thumbnails (per the issue: "no
 * server thumbnails exist yet"), so each template is a styled text card —
 * label, category badge, and its `suited_for` tags — plus a small abstract
 * page motif standing in for a preview image, rather than a real
 * screenshot. Selecting one just updates `template` on the draft; the
 * live-preview panel re-renders against it via the normal debounced
 * autosave.
 *
 * The grid is a real radio group: arrow keys and Space/Enter select, and
 * the chosen card is marked by a ring, a check badge, and the word
 * "Selected" — never colour alone.
 */
export function TemplateGallery({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (templateId: string) => void;
}) {
  const { data: templates, isLoading, error } = useTemplates();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Template</CardTitle>
        <CardDescription>
          Pick the layout this resume is rendered with. You can switch at any time.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <ErrorMessage error={error} />

        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                aria-hidden="true"
                className="h-36 animate-pulse rounded-xl border border-slate-200/80 bg-slate-100/70 dark:border-slate-800 dark:bg-slate-800/40"
              />
            ))}
            <span className="sr-only">Loading templates…</span>
          </div>
        )}

        {!isLoading && templates && templates.length === 0 && (
          <EmptyState
            icon={LayoutTemplate}
            title="No templates available"
            description="Templates are published by the service. Try again in a moment."
          />
        )}

        {!isLoading && templates && templates.length > 0 && (
          <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <legend className="sr-only">Resume template</legend>
            {templates.map((template) => {
              const isSelected = template.id === selected;
              return (
                <label
                  key={template.id}
                  data-testid={`template-card-${template.id}`}
                  className={cn(
                    "group/template flex min-h-[7.5rem] cursor-pointer flex-col gap-3 rounded-xl border p-4 text-left transition-colors duration-150 has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50 sm:p-5",
                    isSelected
                      ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900 dark:border-slate-100 dark:bg-slate-800/60 dark:ring-slate-100"
                      : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/60",
                  )}
                >
                  <input
                    type="radio"
                    name="resume-template"
                    className="sr-only"
                    value={template.id}
                    checked={isSelected}
                    onChange={() => onSelect(template.id)}
                  />
                  <div className="flex items-start gap-3">
                    <TemplateMotif />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                        {template.label}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {template.category}
                      </p>
                    </div>

                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold",
                        isSelected
                          ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                          : "text-slate-400 opacity-0 transition-opacity duration-150 group-hover/template:opacity-100 dark:text-slate-500",
                      )}
                    >
                      <Check aria-hidden="true" className="size-3" />
                      {isSelected ? "Selected" : "Select"}
                    </span>
                  </div>

                  {template.suited_for.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-1.5">
                      {template.suited_for.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </label>
              );
            })}
          </fieldset>
        )}
      </CardContent>
    </Card>
  );
}

/** An abstract page motif standing in for the thumbnail the API doesn't serve. */
function TemplateMotif() {
  return (
    <span
      aria-hidden="true"
      className="hidden h-14 w-11 shrink-0 flex-col gap-1 rounded-sm border border-slate-200 bg-white p-1.5 shadow-xs sm:flex dark:border-slate-700 dark:bg-slate-950"
    >
      <span className="block h-1.5 w-2/3 rounded-full bg-slate-300 dark:bg-slate-600" />
      <span className="block h-0.5 w-full rounded-full bg-slate-200 dark:bg-slate-700" />
      <span className="block h-0.5 w-5/6 rounded-full bg-slate-200 dark:bg-slate-700" />
      <span className="mt-1 block h-1 w-1/2 rounded-full bg-slate-300 dark:bg-slate-600" />
      <span className="block h-0.5 w-full rounded-full bg-slate-200 dark:bg-slate-700" />
      <span className="block h-0.5 w-4/5 rounded-full bg-slate-200 dark:bg-slate-700" />
    </span>
  );
}
