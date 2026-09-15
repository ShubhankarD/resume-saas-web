"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { useProfiles, useCreateProfile, useDeleteProfile } from "@/hooks/use-profiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorMessage } from "@/components/content/error-message";
import { ConfirmDeleteButton } from "@/components/content/confirm-delete-button";

const createSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100)
    .regex(/^[a-z0-9][a-z0-9-_]*$/, "Use lowercase letters, numbers, - or _"),
  label: z.string().min(1, "Label is required").max(255),
});
type CreateForm = z.infer<typeof createSchema>;

export default function ProfilesListPage() {
  const { data: profiles, isLoading, error } = useProfiles();
  const createProfile = useCreateProfile();
  const deleteProfile = useDeleteProfile();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateForm>({ resolver: zodResolver(createSchema) });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Profiles</h1>
        <Button onClick={() => setShowCreateForm((v) => !v)} data-testid="new-profile-button">
          <Plus /> New profile
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardContent className="pt-4">
            <form
              onSubmit={handleSubmit(async (values) => {
                const profile = await createProfile.mutateAsync({
                  name: values.name,
                  label: values.label,
                  tagline: "default",
                  density: "tight",
                  max_pages: 1,
                  template: "resume.html.j2",
                  skills_order: [],
                  skill_overrides: {},
                  groups_order: [],
                  experience: null,
                  education: null,
                  headings: {},
                  bullets: {},
                  bullet_overrides: {},
                });
                reset();
                setShowCreateForm(false);
                window.location.href = `/profiles/${profile.id}`;
              })}
              className="flex flex-col gap-3 sm:flex-row sm:items-end"
            >
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="new-profile-name">Name (id-like, unique)</Label>
                <Input id="new-profile-name" placeholder="google-fde" {...register("name")} />
                {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="new-profile-label">Label</Label>
                <Input id="new-profile-label" placeholder="Google FDE" {...register("label")} />
                {errors.label && <p className="text-destructive text-xs">{errors.label.message}</p>}
              </div>
              <Button type="submit" disabled={createProfile.isPending} data-testid="create-profile-submit">
                {createProfile.isPending ? "Creating…" : "Create"}
              </Button>
            </form>
            <ErrorMessage error={createProfile.error} />
          </CardContent>
        </Card>
      )}

      {isLoading && <p className="text-muted-foreground text-sm">Loading profiles…</p>}
      <ErrorMessage error={error} />

      {profiles?.length === 0 && !isLoading && (
        <p className="text-muted-foreground text-sm">
          No profiles yet — create one to start curating a resume against your content.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {profiles?.map((profile) => (
          <Card key={profile.id} data-testid={`profile-card-${profile.name}`}>
            <CardHeader>
              <CardTitle>{profile.label}</CardTitle>
              <CardDescription>
                {profile.name} · {profile.density} · {profile.max_pages} page
                {profile.max_pages === 1 ? "" : "s"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-2">
              <Button nativeButton={false} render={<Link href={`/profiles/${profile.id}`} />} size="sm">
                Edit
              </Button>
              <ConfirmDeleteButton
                label={`profile ${profile.label}`}
                onConfirm={() => deleteProfile.mutate(profile.id)}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
