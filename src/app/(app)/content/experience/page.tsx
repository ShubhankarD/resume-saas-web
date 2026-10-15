"use client";

import { useState } from "react";
import { Briefcase, Plus } from "lucide-react";
import { useContent, useCreateRole } from "@/hooks/use-content";
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
 * (app/api/content.py) directly — never a full `PUT /content/` — via the
 * scoped mutation hooks in use-content.ts, which invalidate the shared
 * `content` query afterward.
 */
export default function ExperiencePage() {
  const { data: content, isLoading, error } = useContent();
  const [addOpen, setAddOpen] = useState(false);
  const createRoleMutation = useCreateRole();

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
            <RoleEditor key={role.id} role={role} />
          ))}
        </div>
      )}
    </div>
  );
}
