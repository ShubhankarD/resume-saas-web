"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Sparkle } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/page-header";
import type { ContentIn } from "@/lib/api/content";
import type { ProfileWrite } from "@/lib/api/profiles";
import { moveItem } from "@/lib/domain/reorder";
import {
  skillsOverLimit,
  withSkillOverride,
  withSkillToggled,
} from "@/lib/domain/profile-overrides";
import { MAX_SKILLS_GROUPS, ProfileSelection } from "@/lib/profile-draft";
import { SkillAvailableList } from "@/components/profiles/skill-available-list";
import { SkillIncludedRow } from "@/components/profiles/skill-included-row";
import { SortableDndContext } from "@/components/profiles/sortable-dnd";

export function SkillsEditor({
  content,
  draft,
  onChange,
}: {
  content: ContentIn;
  draft: ProfileWrite;
  onChange: (patch: Partial<ProfileWrite>) => void;
}) {
  const allKeys = Object.keys(content.skills);
  const selected = new ProfileSelection(draft, content).skillsOrder();
  const available = allKeys
    .filter((key) => !selected.includes(key))
    .map((key) => ({
      key,
      label: content.skills[key]?.label ?? key,
      text: content.skills[key]?.text ?? "",
    }));
  const overLimit = skillsOverLimit(selected, MAX_SKILLS_GROUPS);
  const atLimit = selected.length >= MAX_SKILLS_GROUPS;

  function toggle(key: string, checked: boolean) {
    const next = withSkillToggled(selected, key, checked, MAX_SKILLS_GROUPS);
    if (next) onChange({ skills_order: next });
  }

  function handleDragEnd(activeId: string, overId: string) {
    const order = moveItem(selected, activeId, overId);
    if (order) onChange({ skills_order: order });
  }

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Skills"
        description={`Pick up to ${MAX_SKILLS_GROUPS} groups, drag them into order, and reword any group for this resume.`}
        action={
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {selected.length} of {MAX_SKILLS_GROUPS} selected
          </span>
        }
      />

      {overLimit > 0 ? (
        <p role="alert" className="text-destructive text-sm" data-testid="skills-over-limit">
          This resume includes every skill group until you pick some. Remove {overLimit} to get to{" "}
          {MAX_SKILLS_GROUPS} — the preview and export won&apos;t work until you do.
        </p>
      ) : null}

      {allKeys.length === 0 ? (
        <EmptyState
          icon={Sparkle}
          title="No skill groups yet"
          description="Add skill groups in the content editor — languages, tools, domains — and they will show up here."
        />
      ) : (
        <>
          {selected.length === 0 ? (
            <EmptyState
              icon={Sparkle}
              title="No skills on this resume"
              description="Pick a group below to add a skills section to this profile."
            />
          ) : (
            <SortableDndContext onDragEnd={handleDragEnd}>
              <SortableContext items={selected} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {selected.map((key) => {
                    const group = content.skills[key];
                    const override = draft.skill_overrides?.[key];
                    return (
                      <SkillIncludedRow
                        key={key}
                        skillKey={key}
                        label={override?.label ?? group?.label ?? key}
                        text={override?.text ?? group?.text ?? ""}
                        onExclude={() => toggle(key, false)}
                        onOverride={(field, value) =>
                          onChange({
                            skill_overrides: withSkillOverride(
                              draft.skill_overrides,
                              key,
                              { label: group.label, text: group.text },
                              field,
                              value,
                            ),
                          })
                        }
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </SortableDndContext>
          )}

          {available.length > 0 && (
            <SkillAvailableList
              skills={available}
              atLimit={atLimit}
              maxGroups={MAX_SKILLS_GROUPS}
              onInclude={(key) => toggle(key, true)}
            />
          )}
        </>
      )}
    </section>
  );
}
