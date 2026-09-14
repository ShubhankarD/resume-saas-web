"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContent, contentQueryKey } from "@/hooks/use-content";
import { upsertEducation, deleteEducation } from "@/lib/api/content";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDeleteButton } from "@/components/content/confirm-delete-button";
import { ErrorMessage } from "@/components/content/error-message";

const createSchema = z.object({
  id: z
    .string()
    .min(1, "Id is required")
    .max(80)
    .regex(/^[a-z0-9][a-z0-9-_]*$/, "Use lowercase letters, numbers, - or _"),
  text: z.string().min(1, "Text is required").max(500),
});
const editSchema = z.object({ text: z.string().min(1, "Text is required").max(500) });

export default function EducationPage() {
  const { data: content, isLoading, error } = useContent();
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: contentQueryKey });

  const upsertMutation = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => upsertEducation(id, { text }),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEducation(id),
    onSuccess: invalidate,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<{ id: string; text: string }>({ resolver: zodResolver(createSchema) });

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading…</p>;
  if (error) return <ErrorMessage error={error} />;
  if (!content) {
    return (
      <p className="text-muted-foreground text-sm">
        You don&apos;t have a content record yet — go to Overview to create one first.
      </p>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Education</CardTitle>
        <CardDescription>A flat list of education entries, each with its own id.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {content.education.length === 0 && (
          <p className="text-muted-foreground text-sm">No education entries yet.</p>
        )}
        {content.education.map((entry) => (
          <EducationRow
            key={entry.id}
            id={entry.id}
            text={entry.text}
            onSave={(text) => upsertMutation.mutateAsync({ id: entry.id, text })}
            onDelete={() => deleteMutation.mutate(entry.id)}
          />
        ))}

        <form
          onSubmit={handleSubmit(async (values) => {
            await upsertMutation.mutateAsync(values);
            reset();
          })}
          className="border-border flex flex-col gap-2 rounded-lg border border-dashed p-3 sm:flex-row sm:items-start"
        >
          <div>
            <Input placeholder="id" className="sm:w-32" {...register("id")} />
            {errors.id && <p className="text-destructive text-xs">{errors.id.message}</p>}
          </div>
          <div className="flex-1">
            <Textarea
              placeholder="BS Computer Science, Somewhere University"
              {...register("text")}
            />
            {errors.text && <p className="text-destructive text-xs">{errors.text.message}</p>}
          </div>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? "Adding…" : "Add"}
          </Button>
        </form>
        <ErrorMessage error={upsertMutation.error} />
      </CardContent>
    </Card>
  );
}

function EducationRow({
  id,
  text,
  onSave,
  onDelete,
}: {
  id: string;
  text: string;
  onSave: (text: string) => Promise<unknown>;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ text: string }>({ resolver: zodResolver(editSchema), defaultValues: { text } });

  if (!editing) {
    return (
      <div className="border-border flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
        <div>
          <p className="text-muted-foreground text-xs">{id}</p>
          <p className="text-sm">{text}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <ConfirmDeleteButton label={`education entry ${id}`} onConfirm={onDelete} />
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSave(values.text);
        setEditing(false);
      })}
      className="border-border flex items-start gap-2 rounded-lg border px-3 py-2"
    >
      <div className="flex-1">
        <Textarea {...register("text")} />
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
