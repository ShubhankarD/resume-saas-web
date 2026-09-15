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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { MetricCard } from "@/components/ui/metric-card";

const WORKFLOW: { href: string; title: string; description: string; icon: LucideIcon }[] = [
  {
    href: "/content",
    title: "Content library",
    description: "Roles, bullets, skills, and education — the source material.",
    icon: Layers,
  },
  {
    href: "/profiles",
    title: "Resume profiles",
    description: "Curate bullets, pick a template, preview, export a PDF.",
    icon: UserRound,
  },
  {
    href: "/jds",
    title: "Job descriptions",
    description: "Save a posting by paste, URL, or upload.",
    icon: FileText,
  },
  {
    href: "/evaluations",
    title: "Evaluations",
    description: "Fit scores and coverage gaps per profile.",
    icon: ClipboardCheck,
  },
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** A single compact destination row — replaces the previous oversized
 * feature cards (§44) with an actionable row that still carries a live count. */
function WorkflowRow({
  href,
  title,
  description,
  icon: Icon,
  meta,
}: {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  meta?: string;
}) {
  return (
    <Link
      href={href}
      className="focus-visible:ring-ring/40 group flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 transition-[border-color,box-shadow,transform] duration-150 ease-out outline-none hover:-translate-y-px hover:border-slate-300 hover:shadow-[0_1px_3px_rgba(15,23,42,0.08)] focus-visible:ring-3 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </span>
        <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
          {description}
        </span>
      </span>
      {meta ? (
        <span className="shrink-0 text-xs text-slate-500 tabular-nums dark:text-slate-400">
          {meta}
        </span>
      ) : null}
      <ArrowRight
        aria-hidden="true"
        className="size-4 shrink-0 text-slate-400 transition-transform duration-150 group-hover:translate-x-0.5"
      />
    </Link>
  );
}

function ActivityRowSkeleton() {
  return (
    <div aria-hidden="true" className="flex items-center gap-3 px-3 py-2.5">
      <div className="bg-muted h-4 w-2/5 animate-pulse rounded-md" />
      <div className="bg-muted ml-auto h-4 w-12 animate-pulse rounded-md" />
    </div>
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
  const evaluationCount = evaluations?.length ?? 0;

  const scored = evaluations?.filter((e) => e.overall_score != null) ?? [];
  const bestScore = scored.length
    ? Math.max(...scored.map((e) => e.overall_score as number))
    : null;

  // Most recent first — the list endpoint has no ordering guarantee, so sort
  // client-side over what the existing hook already returned.
  const recentEvaluations = [...(evaluations ?? [])]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5);

  const jdTitle = (jdId: string) => jds?.find((j) => j.id === jdId)?.title ?? "Untitled role";
  const profileLabel = (profileId: string) =>
    profiles?.find((p) => p.id === profileId)?.label ?? "Profile";

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
    <div className="space-y-6">
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

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Profiles"
          value={profilesLoading ? "—" : profileCount}
          hint="Tailored resumes"
          icon={UserRound}
        />
        <MetricCard
          label="Job descriptions"
          value={jdsLoading ? "—" : jdCount}
          hint="Saved targets"
          icon={FileText}
        />
        <MetricCard
          label="Evaluations"
          value={evaluationsLoading ? "—" : evaluationCount}
          hint="Scored runs"
          icon={ClipboardCheck}
        />
        <MetricCard
          label="Best overall fit"
          value={bestScore != null ? `${bestScore}/10` : "—"}
          hint={
            scored.length
              ? `Across ${scored.length} scored run${scored.length === 1 ? "" : "s"}`
              : "No scores yet"
          }
          progress={bestScore != null ? bestScore * 10 : undefined}
          icon={Sparkles}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="space-y-3">
          <SectionHeader
            title="Recent evaluations"
            description="The latest runs, newest first."
            action={
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<Link href="/evaluations" />}
              >
                View all
                <ArrowRight aria-hidden="true" />
              </Button>
            }
          />
          <Card className="overflow-hidden">
            <CardContent className="px-0">
              {evaluationsLoading ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  <ActivityRowSkeleton />
                  <ActivityRowSkeleton />
                  <ActivityRowSkeleton />
                </div>
              ) : recentEvaluations.length === 0 ? (
                <p className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                  Nothing scored yet. {nextStep.hint}
                </p>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentEvaluations.map((e) => (
                    <li key={e.id}>
                      <Link
                        href={`/evaluations/${e.id}`}
                        className="focus-visible:ring-ring/40 flex items-center gap-3 px-4 py-2.5 transition-colors duration-150 outline-none hover:bg-slate-50 focus-visible:ring-3 dark:hover:bg-slate-800/60"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                            {profileLabel(e.profile_id)}
                          </span>
                          <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                            vs. {jdTitle(e.jd_id)} · {formatDate(e.created_at)}
                          </span>
                        </span>
                        {e.status !== "completed" ? (
                          <Badge variant={e.status === "failed" ? "destructive" : "secondary"}>
                            {e.status}
                          </Badge>
                        ) : null}
                        <span className="shrink-0 text-sm font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                          {e.overall_score != null ? `${e.overall_score}/10` : "—"}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <SectionHeader title="Jump to" description={nextStep.hint} />
          <div className="grid grid-cols-1 gap-2">
            {WORKFLOW.map((item) => (
              <WorkflowRow
                key={item.href}
                href={item.href}
                title={item.title}
                description={item.description}
                icon={item.icon}
                meta={
                  item.href === "/profiles"
                    ? `${profileCount}`
                    : item.href === "/jds"
                      ? `${jdCount}`
                      : item.href === "/evaluations"
                        ? `${evaluationCount}`
                        : undefined
                }
              />
            ))}
          </div>
        </section>
      </div>

      <section className="space-y-3">
        <SectionHeader
          title="Session"
          description="The currently authenticated user, as the API sees it."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
            >
              <RefreshCw
                aria-hidden="true"
                className={refreshMutation.isPending ? "animate-spin" : undefined}
              />
              {refreshMutation.isPending ? "Refreshing…" : "Refresh profile"}
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
    </div>
  );
}
