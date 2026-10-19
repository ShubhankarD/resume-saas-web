import Link from "next/link";
import type { CurationSummary } from "@/lib/api/curations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfirmDeleteButton } from "@/components/content/confirm-delete-button";

export function CurationCard({
  curation: c,
  jdTitle,
  onDelete,
}: {
  curation: CurationSummary;
  jdTitle: string;
  onDelete: (id: string) => void;
}) {
  return (
    <Card interactive data-testid={`curation-card-${c.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="truncate">{c.profile_name}</CardTitle>
          <StatusBadge kind="job" status={c.status} />
        </div>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{jdTitle}</p>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-2">
        <Button
          nativeButton={false}
          render={<Link href={`/curations/${c.id}`} />}
          variant="outline"
          size="sm"
        >
          View
        </Button>
        <ConfirmDeleteButton
          label={`curation job ${c.profile_name}`}
          onConfirm={() => onDelete(c.id)}
        />
      </CardContent>
    </Card>
  );
}
