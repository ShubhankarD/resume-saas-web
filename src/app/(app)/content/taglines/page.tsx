"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContent, contentQueryKey } from "@/hooks/use-content";
import { upsertTagline, deleteTagline } from "@/lib/api/content";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDeleteButton } from "@/components/content/confirm-delete-button";
import { ErrorMessage } from "@/components/content/error-message";

const createSchema = z.object({
  key: z
    .string()
    .min(1, "Key is required")
    .max(80)
    .regex(/^[a-z0-9][a-z0-9-_]*$/, "Use lowercase letters, numbers, - or _"),
  text: z.string().min(1, "Text is required").max(500),
});
const editSchema = z.object({ text: z.string().min(1, "Text is required").max(500) });

export default function TaglinesPage() {
  const { data: content, isLoading, error } = useContent();
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: contentQueryKey });

  const upsertMutation = useMutation({
    mutationFn: ({ key, text }: { key: string; text: string }) => upsertTagline(key, { text }),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (key: string) => deleteTagline(key),
    onSuccess: invalidate,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<{ key: string; text: string }>({ resolver: zodResolver(createSchema) });

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading…</p>;
  if (error) return <ErrorMessage error={error} />;
  if (!content) {
    return (
      <p className="text-muted-foreground text-sm">
        You don&apos;t have a content record yet — go to Overview to create one first.
      </p>
    );
  }

  const entries = Object.entries(content.taglines);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Taglines</CardTitle>
          <CardDescription>
            Short one-line positioning statements, keyed by name (e.g. &quot;default&quot;).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {entries.length === 0 && (
            <p className="text-muted-foreground text-sm">No taglines yet.</p>
          )}
          {entries.map(([key, text]) => (
            <TaglineRow
              key={key}
              taglineKey={key}
              text={text}
              onSave={(newText) => upsertMutation.mutateAsync({ key, text: newText })}
              onDelete={() => deleteMutation.mutate(key)}
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
              <Input placeholder="key" className="sm:w-32" {...register("key")} />
              {errors.key && <p className="text-destructive text-xs">{errors.key.message}</p>}
            </div>
            <div className="flex-1">
              <Textarea placeholder="Tagline text" {...register("text")} />
              {errors.text && <p className="text-destructive text-xs">{errors.text.message}</p>}
            </div>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Adding…" : "Add"}
            </Button>
          </form>
          <ErrorMessage error={upsertMutation.error} />
        </CardContent>
      </Card>
    </div>
  );
}

function TaglineRow({
  taglineKey,
  text,
  onSave,
  onDelete,
}: {
  taglineKey: string;
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
          <p className="text-muted-foreground text-xs">{taglineKey}</p>
          <p className="text-sm">{text}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <ConfirmDeleteButton label={`tagline ${taglineKey}`} onConfirm={onDelete} />
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
