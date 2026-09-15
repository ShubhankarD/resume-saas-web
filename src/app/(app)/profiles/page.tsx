"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileUser, Pencil, Plus } from "lucide-react";
import { useProfiles, useCreateProfile, useDeleteProfile } from "@/hooks/use-profiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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

function ProfileCardSkeleton() {
  return (
    <Card aria-hidden="true">
      <CardContent className="space-y-4">
        <div className="bg-muted h-5 w-2/3 animate-pulse rounded-md" />
        <div className="bg-muted h-4 w-1/2 animate-pulse rounded-md" />
        <div className="bg-muted h-8 w-24 animate-pulse rounded-lg" />
      </CardContent>
    </Card>
  );
}

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

  const createSheet = (
    <Sheet open={showCreateForm} onOpenChange={setShowCreateForm}>
      <SheetTrigger render={<Button variant="cta" data-testid="new-profile-button" />}>
        <Plus aria-hidden="true" />
        New profile
      </SheetTrigger>
      <SheetContent closeLabel="Close new profile panel">
        <SheetHeader>
          <SheetTitle>New profile</SheetTitle>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            A profile is one tailored resume — give it a short id and a human label you&apos;ll
            recognise later.
          </p>
        </SheetHeader>
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
          className="flex flex-col gap-6"
        >
          <FormField
            label="Name"
            htmlFor="new-profile-name"
            hint="Lowercase id, unique — letters, numbers, - or _"
            error={errors.name?.message}
            required
          >
            <Input id="new-profile-name" placeholder="google-fde" {...register("name")} />
          </FormField>

          <FormField
            label="Label"
            htmlFor="new-profile-label"
            hint="Shown across the app"
            error={errors.label?.message}
            required
          >
            <Input id="new-profile-label" placeholder="Google FDE" {...register("label")} />
          </FormField>

          <ErrorMessage error={createProfile.error} />

          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              disabled={createProfile.isPending}
              data-testid="create-profile-submit"
            >
              {createProfile.isPending ? "Creating…" : "Create profile"}
            </Button>
            <SheetClose render={<Button type="button" variant="ghost" />}>Cancel</SheetClose>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Resumes"
        title="Profiles"
        description="Each profile is one tailored resume built from your content library — curate bullets, preview it live, and export a PDF."
        action={createSheet}
      />

      <ErrorMessage error={error} />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ProfileCardSkeleton />
          <ProfileCardSkeleton />
          <ProfileCardSkeleton />
        </div>
      ) : profiles?.length === 0 ? (
        <EmptyState
          icon={FileUser}
          title="No profiles yet"
          description="Create a profile to start curating a resume against the roles, bullets, and skills in your content library."
          action={
            <Button variant="cta" onClick={() => setShowCreateForm(true)}>
              <Plus aria-hidden="true" />
              New profile
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles?.map((profile) => (
            <Card key={profile.id} data-testid={`profile-card-${profile.name}`} className="h-full">
              <CardContent className="flex h-full flex-col gap-5">
                <div className="min-w-0 space-y-2">
                  <h2 className="font-heading truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg dark:text-slate-100">
                    {profile.label}
                  </h2>
                  <p className="truncate font-mono text-xs text-slate-500 dark:text-slate-400">
                    {profile.name}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {profile.density} · {profile.max_pages} page
                    {profile.max_pages === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2">
                  <Button
                    nativeButton={false}
                    render={<Link href={`/profiles/${profile.id}`} />}
                    size="sm"
                  >
                    <Pencil aria-hidden="true" />
                    Edit resume
                  </Button>
                  <ConfirmDeleteButton
                    label={`profile ${profile.label}`}
                    onConfirm={() => deleteProfile.mutate(profile.id)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
