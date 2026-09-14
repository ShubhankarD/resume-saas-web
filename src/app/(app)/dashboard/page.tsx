"use client";

import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/auth/store";
import { getMe } from "@/lib/auth/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const QUICK_LINKS = [
  {
    href: "/content",
    title: "Content",
    description: "Manage your roles, bullets, skills, and education — the source material every profile draws from.",
  },
  {
    href: "/profiles",
    title: "Profiles",
    description: "Tailor a profile for a specific job: pick bullets, choose a template, preview live, and export a PDF.",
  },
];

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
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome{user ? `, ${user.display_name}` : ""}
        </h1>
        <p className="text-muted-foreground text-sm">Pick up where you left off.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {QUICK_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full transition-colors hover:border-primary">
              <CardHeader>
                <CardTitle>{link.title}</CardTitle>
                <CardDescription>{link.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Session</CardTitle>
          <CardDescription>Debug view of the current authenticated user.</CardDescription>
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
