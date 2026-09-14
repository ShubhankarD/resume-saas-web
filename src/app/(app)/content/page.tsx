"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContent, contentQueryKey } from "@/hooks/use-content";
import { putContent } from "@/lib/api/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorMessage } from "@/components/content/error-message";

const scratchSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
});
type ScratchForm = z.infer<typeof scratchSchema>;

export default function ContentOverviewPage() {
  const { data: content, isLoading, error } = useContent();
  const queryClient = useQueryClient();
  const [showScratchForm, setShowScratchForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScratchForm>({ resolver: zodResolver(scratchSchema) });

  const scratchMutation = useMutation({
    mutationFn: (name: string) =>
      putContent({
        name,
        contact: [],
        taglines: {},
        skills: {},
        experience: [],
        education: [],
        application: {},
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentQueryKey });
      setShowScratchForm(false);
    },
  });

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading content…</p>;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (!content) {
    return (
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Let&apos;s build your resume content</CardTitle>
            <CardDescription>
              You don&apos;t have any content yet. Pick one of these to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Button nativeButton={false} render={<Link href="/content/intake" />}>
                Upload an existing resume
              </Button>
              <Button
                nativeButton={false}
                variant="outline"
                render={<Link href="/content/import" />}
              >
                Import a content.yaml file
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowScratchForm((v) => !v)}
                data-testid="start-from-scratch"
              >
                Start from scratch
              </Button>
            </div>

            {showScratchForm && (
              <form
                onSubmit={handleSubmit((values) => scratchMutation.mutate(values.name))}
                className="border-border flex flex-col gap-3 rounded-lg border p-4"
              >
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="scratch-name">Your name</Label>
                  <Input id="scratch-name" placeholder="Jane Doe" {...register("name")} />
                  {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
                </div>
                <ErrorMessage error={scratchMutation.error} />
                <Button
                  type="submit"
                  className="self-start"
                  disabled={scratchMutation.isPending}
                  data-testid="create-empty-content"
                >
                  {scratchMutation.isPending ? "Creating…" : "Create empty content record"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const roleCount = content.experience.length;
  const bulletCount = content.experience.reduce(
    (sum, role) => sum + role.groups.reduce((s, g) => s + g.bullets.length, 0),
    0,
  );

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle data-testid="content-name">{content.name}</CardTitle>
          <CardDescription>Your resume content, at a glance.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <SummaryStat label="Roles" value={roleCount} href="/content/experience" />
            <SummaryStat label="Bullets" value={bulletCount} href="/content/experience" />
            <SummaryStat
              label="Skill groups"
              value={Object.keys(content.skills).length}
              href="/content/skills"
            />
            <SummaryStat
              label="Education"
              value={content.education.length}
              href="/content/education"
            />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryStat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="hover:bg-muted rounded-lg p-2 transition-colors">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="text-2xl font-semibold">{value}</dd>
    </Link>
  );
}
