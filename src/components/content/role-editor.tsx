"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditorCard } from "@/components/ui/editor-card";
import { Accordion } from "@/components/ui/accordion";
import { FormField } from "@/components/ui/form-field";
import { SectionHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDeleteButton } from "@/components/content/confirm-delete-button";
import { ErrorMessage } from "@/components/content/error-message";
import { GroupEditor } from "@/components/content/group-editor";
import type {
  RoleIn,
  RoleUpdate,
  GroupCreate,
  GroupUpdate,
  BulletCreate,
  BulletUpdate,
} from "@/lib/api/content";

const roleUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  org: z.string().min(1, "Organization is required").max(200),
  dates: z.string().min(1, "Dates are required").max(100),
});

const groupCreateSchema = z.object({
  id: z
    .string()
    .min(1, "Id is required")
    .max(80)
    .regex(/^[a-z0-9][a-z0-9-_]*$/, "Use lowercase letters, numbers, - or _"),
  heading: z.string().max(200),
});
type GroupCreateFormValues = z.infer<typeof groupCreateSchema>;

export function RoleEditor({
  role,
  onUpdateRole,
  onDeleteRole,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onCreateBullet,
  onUpdateBullet,
  onDeleteBullet,
}: {
  role: RoleIn;
  onUpdateRole: (body: RoleUpdate) => Promise<unknown>;
  onDeleteRole: () => void;
  onCreateGroup: (body: GroupCreate) => Promise<unknown>;
  onUpdateGroup: (groupId: string, body: GroupUpdate) => Promise<unknown>;
  onDeleteGroup: (groupId: string) => void;
  onCreateBullet: (groupId: string, body: BulletCreate) => Promise<unknown>;
  onUpdateBullet: (groupId: string, bulletId: string, body: BulletUpdate) => Promise<unknown>;
  onDeleteBullet: (groupId: string, bulletId: string) => void;
}) {
  const fieldId = useId();
  const [groupCreateError, setGroupCreateError] = useState<unknown>(null);
  const [roleUpdateError, setRoleUpdateError] = useState<unknown>(null);

  const {
    register: registerRole,
    handleSubmit: handleRoleSubmit,
    formState: { errors: roleErrors, isSubmitting: roleSubmitting, isDirty: roleDirty },
  } = useForm<RoleUpdate>({
    resolver: zodResolver(roleUpdateSchema),
    defaultValues: { title: role.title, org: role.org, dates: role.dates },
  });

  const {
    register: registerGroup,
    handleSubmit: handleGroupSubmit,
    reset: resetGroupForm,
    formState: { errors: groupErrors, isSubmitting: groupSubmitting },
  } = useForm<GroupCreateFormValues>({
    resolver: zodResolver(groupCreateSchema),
    defaultValues: { id: "", heading: "" },
  });

  const bulletCount = role.groups.reduce((sum, group) => sum + group.bullets.length, 0);

  return (
    <EditorCard
      title={role.title || "Untitled role"}
      subtitle={role.org || undefined}
      meta={role.dates || undefined}
      actions={<ConfirmDeleteButton label={`role ${role.title}`} onConfirm={onDeleteRole} />}
    >
      <div className="space-y-8">
        <form
          onSubmit={handleRoleSubmit(async (values) => {
            setRoleUpdateError(null);
            try {
              await onUpdateRole(values);
            } catch (err) {
              setRoleUpdateError(err);
            }
          })}
          className="space-y-5"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              label="Title"
              htmlFor={`${fieldId}-title`}
              error={roleErrors.title?.message}
              required
            >
              <Input
                id={`${fieldId}-title`}
                placeholder="Senior Consultant"
                aria-invalid={roleErrors.title ? true : undefined}
                {...registerRole("title")}
              />
            </FormField>

            <FormField
              label="Organization"
              htmlFor={`${fieldId}-org`}
              error={roleErrors.org?.message}
              required
            >
              <Input
                id={`${fieldId}-org`}
                placeholder="Acme Corp"
                aria-invalid={roleErrors.org ? true : undefined}
                {...registerRole("org")}
              />
            </FormField>

            <FormField
              label="Dates"
              htmlFor={`${fieldId}-dates`}
              error={roleErrors.dates?.message}
              required
              hint="Free text, e.g. “Jan 2024 – Present”."
            >
              <Input
                id={`${fieldId}-dates`}
                placeholder="2020--Present"
                aria-invalid={roleErrors.dates ? true : undefined}
                {...registerRole("dates")}
              />
            </FormField>
          </div>

          <ErrorMessage error={roleUpdateError} />

          <Button type="submit" disabled={roleSubmitting || !roleDirty}>
            {roleSubmitting ? "Saving…" : "Save role details"}
          </Button>
        </form>

        <div className="space-y-4 border-t border-slate-200/80 pt-6 dark:border-slate-800">
          <SectionHeader
            title="Bullet groups"
            description={`${role.groups.length} ${role.groups.length === 1 ? "group" : "groups"} · ${bulletCount} ${bulletCount === 1 ? "bullet" : "bullets"}`}
          />

          {role.groups.length === 0 ? (
            <EmptyState
              title="No bullet groups yet"
              description="Groups keep related accomplishments together — add one below to start writing bullets for this role."
            />
          ) : (
            <Accordion>
              {role.groups.map((group) => (
                <GroupEditor
                  key={group.id}
                  group={group}
                  onUpdateGroup={(body) => onUpdateGroup(group.id, body)}
                  onDeleteGroup={() => onDeleteGroup(group.id)}
                  onCreateBullet={(body) => onCreateBullet(group.id, body)}
                  onUpdateBullet={(bulletId, body) => onUpdateBullet(group.id, bulletId, body)}
                  onDeleteBullet={(bulletId) => onDeleteBullet(group.id, bulletId)}
                />
              ))}
            </Accordion>
          )}

          <form
            onSubmit={handleGroupSubmit(async (values) => {
              setGroupCreateError(null);
              try {
                await onCreateGroup({
                  id: values.id,
                  heading: values.heading.trim() ? values.heading.trim() : undefined,
                });
                resetGroupForm();
              } catch (err) {
                setGroupCreateError(err);
              }
            })}
            className="space-y-5 rounded-xl border border-dashed border-slate-200 p-4 sm:p-5 dark:border-slate-800"
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormField
                label="Group id"
                htmlFor={`${fieldId}-group-id`}
                error={groupErrors.id?.message}
                required
                hint="Lowercase letters, numbers, - or _"
              >
                <Input
                  id={`${fieldId}-group-id`}
                  placeholder="group-id"
                  aria-invalid={groupErrors.id ? true : undefined}
                  {...registerGroup("id")}
                />
              </FormField>

              <FormField
                label="Group heading"
                htmlFor={`${fieldId}-group-heading`}
                hint="Optional."
              >
                <Input
                  id={`${fieldId}-group-heading`}
                  placeholder="e.g. Platform modernisation"
                  {...registerGroup("heading")}
                />
              </FormField>
            </div>

            <ErrorMessage error={groupCreateError} />

            <Button type="submit" variant="outline" disabled={groupSubmitting}>
              <Plus aria-hidden="true" className="size-4" />
              {groupSubmitting ? "Adding…" : "Add group"}
            </Button>
          </form>
        </div>
      </div>
    </EditorCard>
  );
}
