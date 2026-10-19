"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Briefcase } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/page-header";
import type { ContentIn } from "@/lib/api/content";
import type { ProfileWrite } from "@/lib/api/profiles";
import { reorderPatch, roleSortableId } from "@/lib/domain/experience-dnd";
import { ProfileSelection } from "@/lib/profile-draft";
import { RoleCard } from "@/components/profiles/experience-role-card";
import { SortableDndContext } from "@/components/profiles/sortable-dnd";

/**
 * Roles, groups and bullets are reordered under ONE shared `DndContext`
 * (nesting several independent contexts makes their pointer sensors fight
 * over the same events); `lib/domain/experience-dnd` owns the composite id
 * scheme that tells a drag-end which list moved.
 */
export function ExperienceEditor({
  content,
  draft,
  onChange,
}: {
  content: ContentIn;
  draft: ProfileWrite;
  onChange: (patch: Partial<ProfileWrite>) => void;
}) {
  const selection = new ProfileSelection(draft, content);
  const rolesById = new Map(content.experience.map((r) => [r.id, r]));
  const visibleRoles = selection
    .roleOrder()
    .map((roleId) => rolesById.get(roleId))
    .filter((role) => role !== undefined);

  function handleDragEnd(activeId: string, overId: string) {
    const patch = reorderPatch(selection, activeId, overId);
    if (patch) onChange(patch);
  }

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Experience"
        description="Drag a grip to reorder roles, groups, and bullets. Clear a checkbox to leave that bullet — or a whole group — off this resume."
      />

      {visibleRoles.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No experience yet"
          description="Add roles, internships, or projects in the content editor, then choose what belongs on this resume."
        />
      ) : (
        <SortableDndContext onDragEnd={handleDragEnd}>
          <SortableContext
            items={visibleRoles.map((role) => roleSortableId(role.id))}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {visibleRoles.map((role) => (
                <RoleCard
                  key={roleSortableId(role.id)}
                  role={role}
                  content={content}
                  draft={draft}
                  onChange={onChange}
                />
              ))}
            </div>
          </SortableContext>
        </SortableDndContext>
      )}
    </section>
  );
}
