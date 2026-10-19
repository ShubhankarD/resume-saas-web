import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Badge } from "@/components/ui/badge";
import { EditorCard } from "@/components/ui/editor-card";
import type { ContentIn } from "@/lib/api/content";
import type { ProfileWrite } from "@/lib/api/profiles";
import { groupSortableId, roleSortableId } from "@/lib/domain/experience-dnd";
import { ProfileSelection } from "@/lib/profile-draft";
import { GroupBlock } from "@/components/profiles/experience-group-block";
import { SortableGrip, SortableRow } from "@/components/profiles/sortable-row";

type RoleIn = ContentIn["experience"][number];

export function RoleCard({
  role,
  content,
  draft,
  onChange,
}: {
  role: RoleIn;
  content: ContentIn;
  draft: ProfileWrite;
  onChange: (patch: Partial<ProfileWrite>) => void;
}) {
  const selection = new ProfileSelection(draft, content);
  const groupIds = selection.groupOrder(role.id);
  const includedBullets = groupIds.reduce(
    (total, groupId) => total + selection.bulletIds(groupId).length,
    0,
  );

  // `RoleIn` has no location field and `dates` is one freeform string, so the
  // collapsed row reads "<org> · <dates>" rather than inventing sub-fields.
  const summary = [role.org].filter(Boolean).join(" · ");

  return (
    <SortableRow id={roleSortableId(role.id)}>
      <EditorCard
        title={role.title || role.id}
        subtitle={summary || undefined}
        meta={role.dates || undefined}
        defaultOpen
        dragHandle={<SortableGrip label={`Reorder ${role.title || role.id}`} />}
        actions={
          <Badge variant={includedBullets > 0 ? "secondary" : "outline"}>
            {includedBullets} {includedBullets === 1 ? "bullet" : "bullets"}
          </Badge>
        }
      >
        {groupIds.length === 0 ? (
          <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
            This role has no bullet groups yet.
          </p>
        ) : (
          <SortableContext
            items={groupIds.map((groupId) => groupSortableId(role.id, groupId))}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-5">
              {groupIds.map((groupId) => {
                const group = (role.groups ?? []).find((g) => g.id === groupId);
                if (!group) return null;
                return (
                  <GroupBlock
                    key={groupSortableId(role.id, groupId)}
                    roleId={role.id}
                    group={group}
                    draft={draft}
                    onChange={onChange}
                  />
                );
              })}
            </div>
          </SortableContext>
        )}
      </EditorCard>
    </SortableRow>
  );
}
