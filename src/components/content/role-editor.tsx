"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [editingRole, setEditingRole] = useState(false);
  const [groupCreateError, setGroupCreateError] = useState<unknown>(null);
  const [roleUpdateError, setRoleUpdateError] = useState<unknown>(null);

  const {
    register: registerRole,
    handleSubmit: handleRoleSubmit,
    formState: { errors: roleErrors, isSubmitting: roleSubmitting },
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

  return (
    <Card>
      <CardHeader>
        {editingRole ? (
          <form
            onSubmit={handleRoleSubmit(async (values) => {
              setRoleUpdateError(null);
              try {
                await onUpdateRole(values);
                setEditingRole(false);
              } catch (err) {
                setRoleUpdateError(err);
              }
            })}
            className="grid grid-cols-1 gap-2 sm:grid-cols-3"
          >
            <div>
              <Input placeholder="Title" {...registerRole("title")} />
              {roleErrors.title && (
                <p className="text-destructive text-xs">{roleErrors.title.message}</p>
              )}
            </div>
            <div>
              <Input placeholder="Organization" {...registerRole("org")} />
              {roleErrors.org && (
                <p className="text-destructive text-xs">{roleErrors.org.message}</p>
              )}
            </div>
            <div>
              <Input placeholder="Dates" {...registerRole("dates")} />
              {roleErrors.dates && (
                <p className="text-destructive text-xs">{roleErrors.dates.message}</p>
              )}
            </div>
            <div className="sm:col-span-3">
              <ErrorMessage error={roleUpdateError} />
            </div>
            <div className="flex gap-2 sm:col-span-3">
              <Button type="submit" size="sm" disabled={roleSubmitting}>
                {roleSubmitting ? "Saving…" : "Save"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setEditingRole(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-heading text-base font-medium">
                {role.title} <span className="text-muted-foreground font-normal">· {role.org}</span>
              </p>
              <p className="text-muted-foreground text-xs">
                {role.dates} · id: {role.id}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Edit role"
                onClick={() => setEditingRole(true)}
              >
                <Pencil className="size-3.5" />
              </Button>
              <ConfirmDeleteButton label={`role ${role.title}`} onConfirm={onDeleteRole} />
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
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
          className="flex flex-col gap-2 sm:flex-row sm:items-start"
        >
          <div>
            <Input placeholder="group-id" {...registerGroup("id")} className="sm:w-32" />
            {groupErrors.id && <p className="text-destructive text-xs">{groupErrors.id.message}</p>}
          </div>
          <div className="flex-1">
            <Input placeholder="Group heading (optional)" {...registerGroup("heading")} />
          </div>
          <Button type="submit" size="sm" disabled={groupSubmitting}>
            {groupSubmitting ? "Adding…" : "Add group"}
          </Button>
        </form>
        <ErrorMessage error={groupCreateError} />
      </CardContent>
    </Card>
  );
}
