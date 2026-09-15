"use client";

import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowRight,
  ClipboardCheck,
  FileText,
  Layers,
  RefreshCw,
  Sparkles,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuthStore } from "@/lib/auth/store";
import { getMe } from "@/lib/auth/api";
import { useProfiles } from "@/hooks/use-profiles";
import { useJds } from "@/hooks/use-jds";
import { useEvaluations } from "@/hooks/use-evaluations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";

const WORKFLOW: { href: string; title: string; description: string; icon: LucideIcon }[] = [
  {
    href: "/content",
    title: "Content library",
    description:
      "Your roles, bullets, skills, and education — the source material every resume draws from.",
    icon: Layers,
  },
  {
    href: "/profiles",
    title: "Resume profiles",
    description:
      "Curate a tailored resume: pick bullets, choose a template, preview, export a PDF.",
    icon: UserRound,
  },
  {
    href: "/jds",
    title: "Job descriptions",
    description: "Save a posting by paste, URL, or upload, then evaluate a profile against it.",
    icon: FileText,
  },
  {
    href: "/evaluations",
    title: "Evaluations",
    description: "See how each profile scores against a role, with coverage gaps called out.",
    icon: ClipboardCheck,
  },
];

function MetricCard({
  label,
  value,
  href,
  loading,
}: {
  label: string;
  value: number;
  href: string;
  loading: boolean;
}) {
  return (
    <Link
      href={href}
      className="group focus-visible:ring-ring/40 rounded-2xl outline-none focus-visible:ring-3"
    >
      <Card className="h-full transition-shadow duration-200 group-hover:shadow-[0_6px_20px_rgba(0,0,0,0.07)] dark:group-hover:shadow-[0_6px_20px_rgba(0,0,0,0.45)]">
        <CardContent className="space-y-1.5">
          <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            {label}
          </p>
          {loading ? (
            <div className="bg-muted h-9 w-16 animate-pulse rounded-lg" />
          ) : (
            <p className="text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums dark:text-slate-50">
              {value}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const { data: profiles, isLoading: profilesLoading } = useProfiles();
  const { data: jds, isLoading: jdsLoading } = useJds();
  const { data: evaluations, isLoading: evaluationsLoading } = useEvaluations();

  // Re-fetches /api/v1/auth/me through apiFetch — exercises the same
  // authenticated-request path every future protected call will use,
  // including its 401-triggered refresh-and-retry-once logic (see
  // src/lib/api/client.ts) if the in-memory access token has expired.
  const refreshMutation = useMutation({
    mutationFn: () => getMe(),
    onSuccess: (data) => setUser(data),
  });

  const profileCount = profiles?.length ?? 0;
  const jdCount = jds?.length ?? 0;

  // The single most useful next step, derived from what the user already has.
  const nextStep =
    profileCount === 0
      ? {
          href: "/profiles",
          label: "Create your first profile",
          hint: "Start a tailored resume from your content library.",
        }
      : jdCount === 0
        ? {
            href: "/jds",
            label: "Add a job description",
            hint: "Save a posting so you can score a profile against it.",
          }
        : {
            href: "/jds",
            label: "Run an evaluation",
            hint: "Score a profile against a role and close the coverage gaps.",
          };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome${user ? `, ${user.display_name}` : ""}`}
        description="One content library, many tailored resumes. Pick up where you left off."
        action={
          <Button variant="cta" nativeButton={false} render={<Link href={nextStep.href} />}>
            <Sparkles aria-hidden="true" />
            {nextStep.label}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Profiles"
          value={profileCount}
          href="/profiles"
          loading={profilesLoading}
        />
        <MetricCard label="Job descriptions" value={jdCount} href="/jds" loading={jdsLoading} />
        <MetricCard
          label="Evaluations"
          value={evaluations?.length ?? 0}
          href="/evaluations"
          loading={evaluationsLoading}
        />
      </div>

      <section className="space-y-4">
        <SectionHeader title="What to work on next" description={nextStep.hint} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {WORKFLOW.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group focus-visible:ring-ring/40 rounded-2xl outline-none focus-visible:ring-3"
              >
                <Card className="h-full transition-shadow duration-200 group-hover:shadow-[0_6px_20px_rgba(0,0,0,0.07)] dark:group-hover:shadow-[0_6px_20px_rgba(0,0,0,0.45)]">
                  <CardContent className="flex items-start gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <div className="min-w-0 space-y-1">
                      <p className="font-heading flex items-center gap-1.5 text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                        {item.title}
                        <ArrowRight
                          aria-hidden="true"
                          className="size-4 text-slate-400 transition-transform duration-150 group-hover:translate-x-0.5"
                        />
                      </p>
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="Session"
          description="The currently authenticated user, as the API sees it."
        />
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-sm sm:text-sm">{user?.email ?? "Not signed in"}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshMutation.mutate()}
                disabled={refreshMutation.isPending}
              >
                <RefreshCw aria-hidden="true" />
                {refreshMutation.isPending ? "Refreshing…" : "Refresh profile"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre
              data-testid="me-result"
              className="overflow-x-auto rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-600 dark:bg-slate-950/50 dark:text-slate-400"
            >
              {JSON.stringify(user, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
