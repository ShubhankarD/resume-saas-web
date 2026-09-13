"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContent, contentQueryKey } from "@/hooks/use-content";
import { upsertSkill, deleteSkill } from "@/lib/api/content";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDeleteButton } from "@/components/content/confirm-delete-button";
import { ErrorMessage } from "@/components/content/error-message";

const createSchema = z.object({
  key: z
    .string()
    .min(1, "Key is required")
    .max(80)
    .regex(/^[a-z0-9][a-z0-9-_]*$/, "Use lowercase letters, numbers, - or _"),
  label: z.string().min(1, "Label is required").max(100),
  text: z.string().min(1, "Text is required").max(500),
});
const editSchema = z.object({
  label: z.string().min(1, "Label is required").max(100),
  text: z.string().min(1, "Text is required").max(500),
});
type EditValues = z.infer<typeof editSchema>;

export default function SkillsPage() {
  const { data: content, isLoading, error } = useContent();
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: contentQueryKey });

  const upsertMutation = useMutation({
    mutationFn: ({ key, label, text }: { key: string; label: string; text: string }) =>
      upsertSkill(key, { label, text }),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (key: string) => deleteSkill(key),
    onSuccess: invalidate,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<{ key: string; label: string; text: string }>({
    resolver: zodResolver(createSchema),
  });

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading…</p>;
  if (error) return <ErrorMessage error={error} />;
  if (!content) {
    return (
      <p className="text-muted-foreground text-sm">
        You don&apos;t have a content record yet — go to Overview to create one first.
      </p>
    );
  }

  const entries = Object.entries(content.skills);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
        <CardDescription>
          Grouped skills — a key (e.g. &quot;cloud&quot;), a label shown on the resume, and the
          skill text.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {entries.length === 0 && (
          <p className="text-muted-foreground text-sm">No skill groups yet.</p>
        )}
        {entries.map(([key, group]) => (
          <SkillRow
            key={key}
            skillKey={key}
            label={group.label}
            text={group.text}
            onSave={(values) => upsertMutation.mutateAsync({ key, ...values })}
            onDelete={() => deleteMutation.mutate(key)}
          />
        ))}

        <form
          onSubmit={handleSubmit(async (values) => {
            await upsertMutation.mutateAsync(values);
            reset();
          })}
          className="border-border grid grid-cols-1 gap-2 rounded-lg border border-dashed p-3 sm:grid-cols-[100px_140px_1fr_auto]"
        >
          <div>
            <Input placeholder="key" {...register("key")} />
            {errors.key && <p className="text-destructive text-xs">{errors.key.message}</p>}
          </div>
          <div>
            <Input placeholder="Label" {...register("label")} />
            {errors.label && <p className="text-destructive text-xs">{errors.label.message}</p>}
          </div>
          <div>
            <Input placeholder="GCP, AWS, Terraform" {...register("text")} />
            {errors.text && <p className="text-destructive text-xs">{errors.text.message}</p>}
          </div>
          <Button type="submit" size="sm" disabled={isSubmitting} className="self-start">
            {isSubmitting ? "Adding…" : "Add"}
          </Button>
        </form>
        <ErrorMessage error={upsertMutation.error} />
      </CardContent>
    </Card>
  );
}

function SkillRow({
  skillKey,
  label,
  text,
  onSave,
  onDelete,
}: {
  skillKey: string;
  label: string;
  text: string;
  onSave: (values: EditValues) => Promise<unknown>;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditValues>({ resolver: zodResolver(editSchema), defaultValues: { label, text } });

  if (!editing) {
    return (
      <div className="border-border flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
        <div>
          <p className="text-sm font-medium">
            {label} <span className="text-muted-foreground text-xs font-normal">({skillKey})</span>
          </p>
          <p className="text-muted-foreground text-sm">{text}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <ConfirmDeleteButton label={`skill group ${label}`} onConfirm={onDelete} />
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSave(values);
        setEditing(false);
      })}
      className="border-border grid grid-cols-1 gap-2 rounded-lg border px-3 py-2 sm:grid-cols-[140px_1fr_auto_auto]"
    >
      <div>
        <Input {...register("label")} />
        {errors.label && <p className="text-destructive text-xs">{errors.label.message}</p>}
      </div>
      <div>
        <Input {...register("text")} />
        {errors.text && <p className="text-destructive text-xs">{errors.text.message}</p>}
      </div>
      <Button type="submit" size="sm" disabled={isSubmitting}>
        Save
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>
        Cancel
      </Button>
    </form>
  );
}
