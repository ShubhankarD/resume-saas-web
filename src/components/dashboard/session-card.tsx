"use client";

import { RefreshCw } from "lucide-react";
import type { MeResponse } from "@/lib/auth/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/page-header";

export function SessionCard({
  user,
  onRefresh,
  isRefreshing,
}: {
  user: MeResponse | null;
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  return (
    <section className="space-y-3">
      <SectionHeader
        title="Session"
        description="The currently authenticated user, as the API sees it."
        action={
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing}>
            <RefreshCw aria-hidden="true" className={isRefreshing ? "animate-spin" : undefined} />
            {isRefreshing ? "Refreshing…" : "Refresh profile"}
          </Button>
        }
      />
      <Card>
        <CardContent className="space-y-2">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {user?.email ?? "Not signed in"}
          </p>
          <pre
            data-testid="me-result"
            className="max-h-56 overflow-auto rounded-lg bg-slate-50 p-3 text-xs leading-6 text-slate-600 dark:bg-slate-950/50 dark:text-slate-400"
          >
            {JSON.stringify(user, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </section>
  );
}
