"use client";

import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/auth/store";
import { getMe } from "@/lib/auth/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  // Re-fetches /api/v1/auth/me through apiFetch — exercises the same
  // authenticated-request path every future protected call will use,
  // including its 401-triggered refresh-and-retry-once logic (see
  // src/lib/api/client.ts) if the in-memory access token has expired.
  const refreshMutation = useMutation({
    mutationFn: () => getMe(),
    onSuccess: (data) => setUser(data),
  });

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Welcome{user ? `, ${user.display_name}` : ""}</CardTitle>
          <CardDescription>
            You&apos;re signed in. Content editing, profiles, and builds land in later phases
            (F3+).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <pre data-testid="me-result" className="bg-muted overflow-x-auto rounded-md p-3 text-sm">
            {JSON.stringify(user, null, 2)}
          </pre>
          <Button
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
          >
            {refreshMutation.isPending ? "Refreshing…" : "Refresh profile"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
