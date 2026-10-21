"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUser, Plus, Search } from "lucide-react";
import { useProfiles, useDeleteProfile } from "@/hooks/use-profiles";
import { useProfileListView } from "@/hooks/use-profile-list-view";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/content/error-message";
import { ProfileCard, ProfileCardSkeleton } from "@/components/profiles/profile-card";
import { ProfileCreateSheet } from "@/components/profiles/profile-create-sheet";
import { ProfileListToolbar } from "@/components/profiles/profile-list-toolbar";

const GRID_CLASS =
  "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

export default function ProfilesListPage() {
  const { data: profiles, isLoading, error } = useProfiles();
  const deleteProfile = useDeleteProfile();
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const view = useProfileListView(profiles);

  const totalCount = profiles?.length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Resumes"
        title="Profiles"
        description="Each profile is one tailored resume built from your content library."
        action={
          <ProfileCreateSheet
            open={showCreateForm}
            onOpenChange={setShowCreateForm}
            onCreated={(id) => router.push(`/profiles/${id}`)}
          />
        }
      />

      <ErrorMessage error={error} />

      {totalCount > 0 ? (
        <ProfileListToolbar
          query={view.query}
          visibleCount={view.visible.length}
          totalCount={totalCount}
          onSearchChange={view.setSearch}
          onSortChange={view.setSort}
        />
      ) : null}

      {isLoading ? (
        <div className={GRID_CLASS}>
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
      ) : view.visible.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No profiles match that search"
          description="Try a different name, label, or tagline."
          action={
            <Button variant="outline" onClick={view.clearSearch}>
              Clear search
            </Button>
          }
        />
      ) : (
        <div className={GRID_CLASS}>
          {view.visible.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onDelete={(id) => deleteProfile.mutate(id)}
            />
          ))}
        </div>
      )}

      <ErrorMessage error={deleteProfile.error} />
    </div>
  );
}
