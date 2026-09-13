"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { ErrorMessage } from "@/components/content/error-message";
import { RoleEditor } from "@/components/content/role-editor";
import { RoleCreateForm } from "@/components/content/role-create-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Add a role</CardTitle>
          <CardDescription>
            Roles need a unique id (a short slug, e.g. &quot;acme-2022&quot;) plus title, org, and
            dates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoleCreateForm
            existingIds={content.experience.map((r) => r.id)}
            onSubmit={(body) => createRoleMutation.mutateAsync(body)}
            error={createRoleMutation.error}
          />
        </CardContent>
      </Card>

      {content.experience.length === 0 && (
        <p className="text-muted-foreground text-sm">No roles yet — add one above.</p>
      )}

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
  );
}
