"use client";

import { Briefcase, Plus } from "lucide-react";
import type { ContentIn } from "@/lib/api/content";
import { countBullets } from "@/lib/domain/content-overview";
import { pluralize } from "@/lib/domain/plural";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { RoleEditor } from "@/components/content/role-editor";
import { SectionOverline } from "@/components/content/overview-parts";

/** The role editors with a roles/bullets tally, or the empty state when there are none. */
export function RoleList({ roles, onAdd }: { roles: ContentIn["experience"]; onAdd: () => void }) {
  if (roles.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="No experience added yet"
        description="Add a role, internship, or project to start building your work history."
        action={
          <Button variant="cta" onClick={onAdd}>
            <Plus aria-hidden="true" className="size-4" />
            Add experience
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <SectionOverline label="Roles" />
        <p className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
          {pluralize(roles.length, "role")} · {pluralize(countBullets(roles), "bullet")}
        </p>
      </div>

      {roles.map((role) => (
        <RoleEditor key={role.id} role={role} />
      ))}
    </div>
  );
}
