"use client";

import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { ClipboardCheck, FileText, Sparkles, UserRound } from "lucide-react";
import { useAuthStore } from "@/lib/auth/store";
import { getMe } from "@/lib/auth/api";
import { useProfiles } from "@/hooks/use-profiles";
import { useJds } from "@/hooks/use-jds";
import { useEvaluations } from "@/hooks/use-evaluations";
import { labelFor, nextStep, recentEvaluations, summarizeScores } from "@/lib/domain/dashboard";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { RecentEvaluations } from "@/components/dashboard/recent-evaluations";
import { SessionCard } from "@/components/dashboard/session-card";
import { WorkflowLinks } from "@/components/dashboard/workflow-links";

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

  const counts = {
    profiles: profiles?.length ?? 0,
    jds: jds?.length ?? 0,
    evaluations: evaluations?.length ?? 0,
  };
  const scores = summarizeScores(evaluations ?? []);
  const step = nextStep(counts);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome${user ? `, ${user.display_name}` : ""}`}
        description="One content library, many tailored resumes. Pick up where you left off."
        action={
          <Button variant="cta" nativeButton={false} render={<Link href={step.href} />}>
            <Sparkles aria-hidden="true" />
            {step.label}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Profiles"
          value={profilesLoading ? "—" : counts.profiles}
          hint="Tailored resumes"
          icon={UserRound}
        />
        <MetricCard
          label="Job descriptions"
          value={jdsLoading ? "—" : counts.jds}
          hint="Saved targets"
          icon={FileText}
        />
        <MetricCard
          label="Evaluations"
          value={evaluationsLoading ? "—" : counts.evaluations}
          hint="Scored runs"
          icon={ClipboardCheck}
        />
        <MetricCard
          label="Best overall fit"
          value={scores.best != null ? `${scores.best}/10` : "—"}
          hint={
            scores.scoredCount
              ? `Across ${scores.scoredCount} scored run${scores.scoredCount === 1 ? "" : "s"}`
              : "No scores yet"
          }
          progress={scores.best != null ? scores.best * 10 : undefined}
          icon={Sparkles}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <RecentEvaluations
          evaluations={recentEvaluations(evaluations ?? [])}
          isLoading={evaluationsLoading}
          emptyHint={step.hint}
          profileLabel={(id) => labelFor(profiles, id, (p) => p.label, "Profile")}
          jdTitle={(id) => labelFor(jds, id, (j) => j.title, "Untitled role")}
        />

        <section className="space-y-3">
          <SectionHeader title="Jump to" description={step.hint} />
          <WorkflowLinks counts={counts} />
        </section>
      </div>

      <SessionCard
        user={user}
        onRefresh={() => refreshMutation.mutate()}
        isRefreshing={refreshMutation.isPending}
      />
    </div>
  );
}
