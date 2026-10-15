import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { JDSummary } from "@/lib/api/jds";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDeleteButton } from "@/components/content/confirm-delete-button";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function JdCard({ jd, onDelete }: { jd: JDSummary; onDelete: () => void }) {
  return (
    <Card data-testid={`jd-card-${jd.id}`} interactive className="h-full">
      <CardContent className="flex h-full flex-col gap-3">
        <div className="min-w-0 space-y-1">
          <h2 className="truncate text-sm font-semibold tracking-[-0.01em] text-slate-900 dark:text-slate-100">
            {jd.title ?? "Untitled"}
          </h2>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {jd.company ?? "Company not set"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{jd.source_type}</Badge>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Added {formatDate(jd.created_at)}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <Button nativeButton={false} render={<Link href={`/jds/${jd.id}`} />} size="sm">
            Open
            <ArrowRight aria-hidden="true" />
          </Button>
          <ConfirmDeleteButton
            label={`job description ${jd.title ?? jd.id}`}
            onConfirm={onDelete}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function JdCardSkeleton() {
  return (
    <Card aria-hidden="true">
      <CardContent className="space-y-3">
        <div className="bg-muted h-4 w-2/3 animate-pulse rounded-md" />
        <div className="bg-muted h-3 w-1/2 animate-pulse rounded-md" />
        <div className="bg-muted h-3 w-1/3 animate-pulse rounded-md" />
        <div className="bg-muted h-8 w-24 animate-pulse rounded-md" />
      </CardContent>
    </Card>
  );
}
