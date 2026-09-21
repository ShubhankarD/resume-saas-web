"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileUser, Loader2, Pencil, Plus, Search } from "lucide-react";
import { useProfiles, useCreateProfile, useDeleteProfile } from "@/hooks/use-profiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PageToolbar } from "@/components/ui/page-toolbar";
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
      <CardContent className="space-y-3">
        <div className="bg-muted h-4 w-2/3 animate-pulse rounded-md" />
        <div className="bg-muted h-3 w-1/3 animate-pulse rounded-md" />
        <div className="bg-muted h-3 w-1/2 animate-pulse rounded-md" />
        <div className="bg-muted h-8 w-24 animate-pulse rounded-md" />
      </CardContent>
    </Card>
  );
}

type SortKey = "label" | "name" | "pages";

const SORT_LABELS: Record<SortKey, string> = {
  label: "Label (A–Z)",
  name: "Name (A–Z)",
  pages: "Most pages",
};

export default function ProfilesListPage() {
  const { data: profiles, isLoading, error } = useProfiles();
  const createProfile = useCreateProfile();
  const deleteProfile = useDeleteProfile();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("label");

  // Client-side only — filters and orders what `useProfiles()` already
  // returned; the list endpoint takes no search or sort parameters.
  const visibleProfiles = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? (profiles ?? []).filter(
          (p) =>
            p.label.toLowerCase().includes(needle) ||
            p.name.toLowerCase().includes(needle) ||
            p.tagline.toLowerCase().includes(needle),
        )
      : (profiles ?? []);
    return [...filtered].sort((a, b) => {
      if (sort === "pages") return b.max_pages - a.max_pages || a.label.localeCompare(b.label);
      if (sort === "name") return a.name.localeCompare(b.name);
      return a.label.localeCompare(b.label);
    });
  }, [profiles, query, sort]);

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
          className="flex flex-col gap-4"
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

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              type="submit"
              disabled={createProfile.isPending}
              data-testid="create-profile-submit"
            >
              {createProfile.isPending ? (
                <Loader2 aria-hidden="true" className="animate-spin" />
              ) : null}
              {createProfile.isPending ? "Creating…" : "Create profile"}
            </Button>
            <SheetClose render={<Button type="button" variant="ghost" />}>Cancel</SheetClose>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );

  const hasProfiles = (profiles?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Resumes"
        title="Profiles"
        description="Each profile is one tailored resume built from your content library."
        action={createSheet}
      />

      <ErrorMessage error={error} />

      {hasProfiles ? (
        <PageToolbar
          className="rounded-lg border px-3 py-2 md:px-4"
          left={
            <div className="relative w-full sm:w-72">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
              />
              <Input
                type="search"
                aria-label="Search profiles"
                placeholder="Search profiles…"
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          }
          right={
            <>
              <label htmlFor="profiles-sort" className="sr-only">
                Sort profiles
              </label>
              <select
                id="profiles-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-700 dark:focus:border-slate-600 dark:focus:ring-white/10"
              >
                {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                  <option key={key} value={key}>
                    {SORT_LABELS[key]}
                  </option>
                ))}
              </select>
              <span className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
                {visibleProfiles.length} of {profiles?.length ?? 0}
              </span>
            </>
          }
        />
      ) : null}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          <ProfileCardSkeleton />
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
      ) : visibleProfiles.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No profiles match that search"
          description="Try a different name, label, or tagline."
          action={
            <Button variant="outline" onClick={() => setQuery("")}>
              Clear search
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {visibleProfiles.map((profile) => (
            <Card
              key={profile.id}
              data-testid={`profile-card-${profile.name}`}
              interactive
              className="h-full"
            >
              <CardContent className="flex h-full flex-col gap-3">
                <div className="min-w-0 space-y-1">
                  <h2 className="truncate text-sm font-semibold tracking-[-0.01em] text-slate-900 dark:text-slate-100">
                    {profile.label}
                  </h2>
                  <p className="truncate font-mono text-xs text-slate-500 dark:text-slate-400">
                    {profile.name}
                  </p>
                </div>

                <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <div className="min-w-0">
                    <dt className="sr-only">Density</dt>
                    <dd className="truncate">{profile.density}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="sr-only">Page limit</dt>
                    <dd className="truncate tabular-nums">
                      {profile.max_pages} page{profile.max_pages === 1 ? "" : "s"}
                    </dd>
                  </div>
                  <div className="col-span-2 min-w-0">
                    <dt className="sr-only">Tagline</dt>
                    <dd className="truncate">{profile.tagline}</dd>
                  </div>
                </dl>

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

      <ErrorMessage error={deleteProfile.error} />
    </div>
  );
}
