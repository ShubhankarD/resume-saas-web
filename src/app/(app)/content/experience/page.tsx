"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Briefcase, Plus } from "lucide-react";
import { useContent, contentQueryKey } from "@/hooks/use-content";
import {
  createRole,
  updateRole,
  deleteRole,
  createGroup,
  updateGroup,
  deleteGroup,
  createBullet,
  updateBullet,
  deleteBullet,
  type RoleCreate,
  type RoleUpdate,
  type GroupCreate,
  type GroupUpdate,
  type BulletCreate,
  type BulletUpdate,
} from "@/lib/api/content";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ErrorMessage } from "@/components/content/error-message";
import { RoleEditor } from "@/components/content/role-editor";
import { RoleCreateForm } from "@/components/content/role-create-form";
import { ContentSkeleton, NoContentRecord } from "@/components/content/content-states";

/**
 * The nested roles -> groups -> bullets editor (plans/phase-F3-content-editor.md).
 * Every add/edit/delete here calls the granular CRUD endpoints
 * (app/api/content.py) directly — never a full `PUT /content/` — and
 * invalidates the shared `content` query afterward so every view (this
 * page, the overview counts, YAML export) reflects real backend state.
 */
export default function ExperiencePage() {
  const { data: content, isLoading, error } = useContent();
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);

  function invalidate() {
    return queryClient.invalidateQueries({ queryKey: contentQueryKey });
  }

  const createRoleMutation = useMutation({
    mutationFn: (body: RoleCreate) => createRole(body),
    onSuccess: invalidate,
  });
  const updateRoleMutation = useMutation({
    mutationFn: ({ roleId, body }: { roleId: string; body: RoleUpdate }) =>
      updateRole(roleId, body),
    onSuccess: invalidate,
  });
  const deleteRoleMutation = useMutation({
    mutationFn: (roleId: string) => deleteRole(roleId),
    onSuccess: invalidate,
  });

  const createGroupMutation = useMutation({
    mutationFn: ({ roleId, body }: { roleId: string; body: GroupCreate }) =>
      createGroup(roleId, body),
    onSuccess: invalidate,
  });
  const updateGroupMutation = useMutation({
    mutationFn: ({
      roleId,
      groupId,
      body,
    }: {
      roleId: string;
      groupId: string;
      body: GroupUpdate;
    }) => updateGroup(roleId, groupId, body),
    onSuccess: invalidate,
  });
  const deleteGroupMutation = useMutation({
    mutationFn: ({ roleId, groupId }: { roleId: string; groupId: string }) =>
      deleteGroup(roleId, groupId),
    onSuccess: invalidate,
  });

  const createBulletMutation = useMutation({
    mutationFn: ({
      roleId,
      groupId,
      body,
    }: {
      roleId: string;
      groupId: string;
      body: BulletCreate;
    }) => createBullet(roleId, groupId, body),
    onSuccess: invalidate,
  });
  const updateBulletMutation = useMutation({
    mutationFn: ({
      roleId,
      groupId,
      bulletId,
      body,
    }: {
      roleId: string;
      groupId: string;
      bulletId: string;
      body: BulletUpdate;
    }) => updateBullet(roleId, groupId, bulletId, body),
    onSuccess: invalidate,
  });
  const deleteBulletMutation = useMutation({
    mutationFn: ({
      roleId,
      groupId,
      bulletId,
    }: {
      roleId: string;
      groupId: string;
      bulletId: string;
    }) => deleteBullet(roleId, groupId, bulletId),
    onSuccess: invalidate,
  });

  const header = (action?: React.ReactNode) => (
    <PageHeader
      eyebrow="Content library"
      title="Experience"
      description="Each role holds bullet groups, and each group holds the accomplishments a tailored resume draws from."
      action={action}
    />
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {header()}
        <ContentSkeleton rows={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        {header()}
        <ErrorMessage error={error} />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="space-y-6">
        {header()}
        <NoContentRecord section="your experience" />
      </div>
    );
  }

  const roleCount = content.experience.length;
  const bulletCount = content.experience.reduce(
    (sum, role) => sum + role.groups.reduce((s, g) => s + g.bullets.length, 0),
    0,
  );

  return (
    <div className="space-y-6">
      {header(
        <Sheet open={addOpen} onOpenChange={setAddOpen}>
          <SheetTrigger
            render={
              <Button variant="cta">
                <Plus aria-hidden="true" className="size-4" />
                Add role
              </Button>
            }
          />
          <SheetContent className="max-w-lg">
            <SheetHeader>
              <SheetTitle>Add a role</SheetTitle>
            </SheetHeader>
            <RoleCreateForm
              existingIds={content.experience.map((r) => r.id)}
              onSubmit={async (body) => {
                await createRoleMutation.mutateAsync(body);
                setAddOpen(false);
              }}
              error={createRoleMutation.error}
            />
          </SheetContent>
        </Sheet>,
      )}

      {roleCount === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No experience added yet"
          description="Add a role, internship, or project to start building your work history."
          action={
            <Button variant="cta" onClick={() => setAddOpen(true)}>
              <Plus aria-hidden="true" className="size-4" />
              Add experience
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Roles
            </h2>
            <p className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
              {roleCount} {roleCount === 1 ? "role" : "roles"} · {bulletCount}{" "}
              {bulletCount === 1 ? "bullet" : "bullets"}
            </p>
          </div>

          {content.experience.map((role) => (
            <RoleEditor
              key={role.id}
              role={role}
              onUpdateRole={(body) => updateRoleMutation.mutateAsync({ roleId: role.id, body })}
              onDeleteRole={() => deleteRoleMutation.mutate(role.id)}
              onCreateGroup={(body) => createGroupMutation.mutateAsync({ roleId: role.id, body })}
              onUpdateGroup={(groupId, body) =>
                updateGroupMutation.mutateAsync({ roleId: role.id, groupId, body })
              }
              onDeleteGroup={(groupId) => deleteGroupMutation.mutate({ roleId: role.id, groupId })}
              onCreateBullet={(groupId, body) =>
                createBulletMutation.mutateAsync({ roleId: role.id, groupId, body })
              }
              onUpdateBullet={(groupId, bulletId, body) =>
                updateBulletMutation.mutateAsync({ roleId: role.id, groupId, bulletId, body })
              }
              onDeleteBullet={(groupId, bulletId) =>
                deleteBulletMutation.mutate({ roleId: role.id, groupId, bulletId })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
