"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDeleteButton } from "@/components/content/confirm-delete-button";
import { ErrorMessage } from "@/components/content/error-message";
import { BulletRow, BulletCreateForm } from "@/components/content/bullet-row";
import type { GroupIn, GroupUpdate, BulletCreate, BulletUpdate } from "@/lib/api/content";

const groupUpdateSchema = z.object({
  heading: z.string().max(200),
});
type GroupUpdateFormValues = z.infer<typeof groupUpdateSchema>;

export function GroupEditor({
  group,
  onUpdateGroup,
  onDeleteGroup,
  onCreateBullet,
  onUpdateBullet,
  onDeleteBullet,
}: {
  group: GroupIn;
  onUpdateGroup: (body: GroupUpdate) => Promise<unknown>;
  onDeleteGroup: () => void;
  onCreateBullet: (body: BulletCreate) => Promise<unknown>;
  onUpdateBullet: (bulletId: string, body: BulletUpdate) => Promise<unknown>;
  onDeleteBullet: (bulletId: string) => void;
}) {
  const [editingHeading, setEditingHeading] = useState(false);
  const [createError, setCreateError] = useState<unknown>(null);
  const [updateError, setUpdateError] = useState<unknown>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<GroupUpdateFormValues>({
    resolver: zodResolver(groupUpdateSchema),
    defaultValues: { heading: group.heading ?? "" },
  });

  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        {editingHeading ? (
          <form
            onSubmit={handleSubmit(async (values) => {
              setUpdateError(null);
              try {
                await onUpdateGroup({
                  heading: values.heading.trim() ? values.heading.trim() : undefined,
                });
                setEditingHeading(false);
              } catch (err) {
                setUpdateError(err);
              }
            })}
            className="flex flex-1 flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <Input placeholder="Group heading (optional)" {...register("heading")} />
              <Button type="submit" size="sm" disabled={isSubmitting}>
                Save
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setEditingHeading(false)}
              >
                Cancel
              </Button>
            </div>
            <ErrorMessage error={updateError} />
          </form>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {group.heading ?? (
                  <span className="text-muted-foreground italic">Untitled group</span>
                )}
              </span>
              <span className="text-muted-foreground text-xs">({group.id})</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Edit group heading"
                onClick={() => setEditingHeading(true)}
              >
                <Pencil className="size-3.5" />
              </Button>
              <ConfirmDeleteButton
                label={`group ${group.heading ?? group.id}`}
                onConfirm={onDeleteGroup}
              />
            </div>
          </>
        )}
      </div>

      <ul className="flex flex-col gap-2">
        {group.bullets.map((bullet) => (
          <BulletRow
            key={bullet.id}
            bullet={bullet}
            onUpdate={(body) => onUpdateBullet(bullet.id, body)}
            onDelete={() => onDeleteBullet(bullet.id)}
          />
        ))}
      </ul>

      <div className="mt-2">
        <BulletCreateForm
          error={createError}
          onSubmit={async (values) => {
            setCreateError(null);
            try {
              await onCreateBullet(values);
            } catch (err) {
              setCreateError(err);
              throw err;
            }
          }}
        />
      </div>
    </div>
  );
}
