"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditorCard } from "@/components/ui/editor-card";
import { Accordion } from "@/components/ui/accordion";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDeleteButton } from "@/components/content/confirm-delete-button";
import { GroupCreateForm } from "@/components/content/group-create-form";
import { GroupEditor } from "@/components/content/group-editor";
import { RoleDetailsForm } from "@/components/content/role-details-form";
import { useRoleActions } from "@/hooks/use-content";
import type { RoleIn } from "@/lib/api/content";

/** One role card. Owns its role-scoped mutations (useRoleActions) rather
 * than taking them as callbacks; each GroupEditor does the same for its
 * group, so ids never need threading through props. */
export function RoleEditor({ role }: { role: RoleIn }) {
  const actions = useRoleActions(role.id);
  const [addingGroup, setAddingGroup] = useState(false);

  const bulletCount = role.groups.reduce((sum, group) => sum + group.bullets.length, 0);

  return (
    <EditorCard
      title={role.title || "Untitled role"}
      subtitle={role.org || undefined}
      meta={role.dates || undefined}
      actions={
        <ConfirmDeleteButton
          label={`role ${role.title}`}
          onConfirm={() => actions.remove.mutate()}
        />
      }
    >
      <div className="space-y-6">
        <RoleDetailsForm
          role={role}
          onSave={(body) => actions.update.mutateAsync(body)}
          error={actions.update.error}
        />

        <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Bullet groups
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {role.groups.length} {role.groups.length === 1 ? "group" : "groups"} · {bulletCount}{" "}
                {bulletCount === 1 ? "bullet" : "bullets"}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-expanded={addingGroup}
              onClick={() => setAddingGroup((v) => !v)}
            >
              <Plus aria-hidden="true" className="size-3.5" />
              Add group
            </Button>
          </div>

          {role.groups.length === 0 ? (
            addingGroup ? null : (
              <EmptyState
                title="No bullet groups yet"
                description="Groups keep related accomplishments together — add one to start writing bullets."
                action={
                  <Button type="button" size="sm" onClick={() => setAddingGroup(true)}>
                    <Plus aria-hidden="true" className="size-3.5" />
                    Add group
                  </Button>
                }
              />
            )
          ) : (
            <Accordion>
              {role.groups.map((group) => (
                <GroupEditor key={group.id} roleId={role.id} group={group} />
              ))}
            </Accordion>
          )}

          {addingGroup && (
            <GroupCreateForm
              error={actions.createGroup.error}
              onCancel={() => setAddingGroup(false)}
              onSubmit={async (body) => {
                await actions.createGroup.mutateAsync(body);
                setAddingGroup(false);
              }}
            />
          )}
        </div>
      </div>
    </EditorCard>
  );
}
