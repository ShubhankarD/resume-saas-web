"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { intakeResume } from "@/lib/api/content-upload";
import { putContent, type IntakeResponse } from "@/lib/api/content";
import { contentQueryKey } from "@/hooks/use-content";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ErrorMessage } from "@/components/content/error-message";

/**
 * Resume-upload "intake" flow (POST /api/v1/content/intake). The backend
 * never persists this — it's a stateless LLM extraction that hands back a
 * ContentIn-shaped draft plus `warnings` for the human to review. This page
 * enforces the same rule client-side: nothing gets saved until the user
 * explicitly clicks "Save this draft", which does a real
 * `PUT /api/v1/content/` with (lightly edited) draft — never auto-saved on
 * the intake response itself.
 */
export default function IntakePage() {
  const [draft, setDraft] = useState<IntakeResponse | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  const intakeMutation = useMutation({
    mutationFn: (file: File) => intakeResume(file),
    onSuccess: (data) => setDraft(data),
  });

  const saveMutation = useMutation({
    mutationFn: (toSave: IntakeResponse) => {
      const contentIn: import("@/lib/api/content").ContentIn = {
        name: toSave.name,
        photo: toSave.photo,
        contact: toSave.contact,
        taglines: toSave.taglines,
        skills: toSave.skills,
        experience: toSave.experience,
        education: toSave.education,
        application: toSave.application,
      };
      return putContent(contentIn);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentQueryKey });
      router.push("/content");
    },
  });

  if (!draft) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upload an existing resume</CardTitle>
          <CardDescription>
            Upload a PDF, DOCX, or plain-text resume. We&apos;ll extract a draft for you to review —
            nothing is saved until you explicitly approve it.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <input
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            data-testid="intake-file-input"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) intakeMutation.mutate(file);
            }}
            className="text-sm"
          />
          {intakeMutation.isPending && (
            <p className="text-muted-foreground text-sm">
              Extracting a draft… this can take a moment.
            </p>
          )}
          <ErrorMessage error={intakeMutation.error} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {draft.warnings.length > 0 && (
        <Card className="border-amber-500/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
              <AlertTriangle className="size-4" /> Review before saving
            </CardTitle>
            <CardDescription>
              The extraction flagged the following — double-check these sections.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm">
              {draft.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Review the extracted draft</CardTitle>
          <CardDescription>
            Nothing is saved yet — check this over, then save it below.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="draft-name">Name</Label>
            <Input
              id="draft-name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </div>

          <Section title="Contact">
            {draft.contact.length === 0 ? (
              <Empty />
            ) : (
              <ul className="text-sm">
                {draft.contact.map((c, i) => (
                  <li key={i}>
                    {c.icon}: {c.text} {c.url && `(${c.url})`}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Taglines">
            {Object.keys(draft.taglines).length === 0 ? (
              <Empty />
            ) : (
              <ul className="text-sm">
                {Object.entries(draft.taglines).map(([key, text]) => (
                  <li key={key}>
                    <span className="text-muted-foreground">{key}:</span> {text}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Skills">
            {Object.keys(draft.skills).length === 0 ? (
              <Empty />
            ) : (
              <div className="flex flex-wrap gap-2">
                {Object.entries(draft.skills).map(([key, group]) => (
                  <Badge key={key} variant="outline">
                    {group.label}: {group.text}
                  </Badge>
                ))}
              </div>
            )}
          </Section>

          <Section
            title={`Experience (${draft.experience.length} role${draft.experience.length === 1 ? "" : "s"})`}
          >
            {draft.experience.length === 0 ? (
              <Empty />
            ) : (
              <div className="flex flex-col gap-3">
                {draft.experience.map((role) => (
                  <div key={role.id} className="border-border rounded-lg border p-2">
                    <p className="text-sm font-medium">
                      {role.title} · {role.org}{" "}
                      <span className="text-muted-foreground font-normal">({role.dates})</span>
                    </p>
                    {role.groups.map((group) => (
                      <ul key={group.id} className="mt-1 list-disc pl-5 text-sm">
                        {group.bullets.map((b) => (
                          <li key={b.id}>{b.text}</li>
                        ))}
                      </ul>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Education">
            {draft.education.length === 0 ? (
              <Empty />
            ) : (
              <ul className="list-disc pl-5 text-sm">
                {draft.education.map((e) => (
                  <li key={e.id}>{e.text}</li>
                ))}
              </ul>
            )}
          </Section>

          <ErrorMessage error={saveMutation.error} />
          <div className="flex gap-2">
            <Button
              onClick={() => saveMutation.mutate(draft)}
              disabled={saveMutation.isPending}
              data-testid="save-intake-draft"
            >
              {saveMutation.isPending ? "Saving…" : "Save this draft"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setDraft(null)}
              disabled={saveMutation.isPending}
            >
              Discard and start over
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1 text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function Empty() {
  return <p className="text-muted-foreground text-sm italic">Nothing detected.</p>;
}
