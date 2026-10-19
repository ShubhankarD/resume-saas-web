import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { ApplicationSummary } from "@/lib/api/applications";
import { jobDomain } from "@/lib/domain/application";
import { isTerminalStatus } from "@/lib/domain/job-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfirmDeleteButton } from "@/components/content/confirm-delete-button";

export function ApplicationCard({
  application: a,
  onDelete,
}: {
  application: ApplicationSummary;
  onDelete: (id: string) => void;
}) {
  return (
    <Card interactive data-testid={`application-card-${a.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="truncate">{jobDomain(a.job_url)}</CardTitle>
          <StatusBadge kind="application" status={a.status} />
        </div>
        <a
          href={a.job_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 truncate text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ExternalLink aria-hidden="true" className="size-3 shrink-0" />
          <span className="truncate">{a.job_url}</span>
        </a>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-2">
        <Button
          nativeButton={false}
          render={<Link href={`/applications/${a.id}`} />}
          variant="outline"
          size="sm"
        >
          {isTerminalStatus("application", a.status) ? "View" : "Watch live"}
        </Button>
        <ConfirmDeleteButton
          label={`application to ${jobDomain(a.job_url)}`}
          onConfirm={() => onDelete(a.id)}
        />
      </CardContent>
    </Card>
  );
}
