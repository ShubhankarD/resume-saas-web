"use client";

import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ErrorMessage } from "@/components/content/error-message";
import { useTemplates } from "@/hooks/use-templates";
import { cn } from "cn";

/**
 * GET /api/v1/templates/ has no server-side thumbnails (per the issue: "no
 * server thumbnails exist yet"), so each template is a styled text card —
 * id, label, category badge, and its `suited_for` tags — rather than a
 * visual preview image. Selecting one just updates `template` on the
 * draft; the live-preview panel re-renders against it via the normal
 * debounced autosave.
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
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-muted-foreground text-sm">Loading templates…</p>}
        <ErrorMessage error={error} />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {templates?.map((template) => {
            const isSelected = template.id === selected;
            return (
              <button
                key={template.id}
                type="button"
                data-testid={`template-card-${template.id}`}
                onClick={() => onSelect(template.id)}
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{template.label}</p>
                  {isSelected && <Check className="text-primary size-4 shrink-0" />}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  <Badge variant="outline">{template.category}</Badge>
                  {template.suited_for.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
