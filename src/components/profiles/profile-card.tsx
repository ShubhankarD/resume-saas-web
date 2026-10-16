import Link from "next/link";
import { Pencil } from "lucide-react";
import type { ProfileSummary } from "@/lib/api/profiles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDeleteButton } from "@/components/content/confirm-delete-button";

export function ProfileCardSkeleton() {
  return (
    <Card aria-hidden="true">
      <CardContent className="space-y-3">
        <div className="bg-muted h-4 w-2/3 animate-pulse rounded-md" />
        <div className="bg-muted h-3 w-1/3 animate-pulse rounded-md" />
        <div className="bg-muted h-3 w-1/2 animate-pulse rounded-md" />
        <div className="bg-muted h-8 w-24 animate-pulse rounded-md" />
      </CardContent>
    </Card>
  );
}

export function ProfileCard({
  profile,
  onDelete,
}: {
  profile: ProfileSummary;
  onDelete: (id: string) => void;
}) {
  return (
    <Card data-testid={`profile-card-${profile.name}`} interactive className="h-full">
      <CardContent className="flex h-full flex-col gap-3">
        <div className="min-w-0 space-y-1">
          <h2 className="truncate text-sm font-semibold tracking-[-0.01em] text-slate-900 dark:text-slate-100">
            {profile.label}
          </h2>
          <p className="truncate font-mono text-xs text-slate-500 dark:text-slate-400">
            {profile.name}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <div className="min-w-0">
            <dt className="sr-only">Density</dt>
            <dd className="truncate">{profile.density}</dd>
          </div>
          <div className="min-w-0">
            <dt className="sr-only">Page limit</dt>
            <dd className="truncate tabular-nums">
              {profile.max_pages} page{profile.max_pages === 1 ? "" : "s"}
            </dd>
          </div>
          <div className="col-span-2 min-w-0">
            <dt className="sr-only">Tagline</dt>
            <dd className="truncate">{profile.tagline}</dd>
          </div>
        </dl>

        <div className="mt-auto flex items-center justify-between gap-2">
          <Button nativeButton={false} render={<Link href={`/profiles/${profile.id}`} />} size="sm">
            <Pencil aria-hidden="true" />
            Edit resume
          </Button>
          <ConfirmDeleteButton
            label={`profile ${profile.label}`}
            onConfirm={() => onDelete(profile.id)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
