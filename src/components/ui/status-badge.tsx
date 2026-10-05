import { Badge } from "@/components/ui/badge";
import { statusMeta, type StatusKind } from "@/lib/domain/job-status";

/** A job's status as a badge, toned from the shared status table
 * (lib/domain/job-status.ts) so every list and detail page agrees. */
export function StatusBadge({
  kind,
  status,
  ...props
}: { kind: StatusKind; status: string } & Omit<React.ComponentProps<typeof Badge>, "variant">) {
  return (
    <Badge variant={statusMeta(kind, status).tone} {...props}>
      {status}
    </Badge>
  );
}
