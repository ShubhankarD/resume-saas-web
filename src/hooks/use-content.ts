"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/client";
import {
  createBullet,
  createGroup,
  createRole,
  deleteBullet,
  deleteEducation,
  deleteGroup,
  deleteRole,
  deleteSkill,
  deleteTagline,
  getContent,
  putContent,
  updateBullet,
  updateGroup,
  updateRole,
  upsertEducation,
  upsertSkill,
  upsertTagline,
  type BulletCreate,
  type BulletUpdate,
  type ContentIn,
  type GroupCreate,
  type GroupUpdate,
  type RoleCreate,
  type RoleUpdate,
  type SkillGroupUpdate,
} from "@/lib/api/content";
import { importContentYaml } from "@/lib/api/content-upload";
import { queryKeys } from "@/lib/query-keys";

/**
 * Shared GET /api/v1/content/ query. A 404 means "no content record yet"
 * (see app/api/content.py's get_content()) — the empty state, not a hard
 * error — so it's surfaced as `content: null` instead of `error`. Any other
 * failure (401 already handled by apiFetch's refresh-retry, 5xx, network)
 * still comes back as `error` for the caller to render.
 */
export function useContent() {
  return useQuery<ContentIn | null>({
    queryKey: queryKeys.content,
    queryFn: async () => {
      try {
        return await getContent();
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          return null;
        }
        throw err;
      }
    },
  });
}

/**
 * Every content write goes through this: it runs `mutationFn` and then
 * invalidates the shared `content` query, so every view (the editors, the
 * overview counts, YAML export) reflects real backend state. Callers that
 * need their own follow-up (navigate, close a form) pass it per call via
 * `mutate(vars, { onSuccess })`.
 */
function useContentMutation<TVars, TData>(mutationFn: (vars: TVars) => Promise<TData>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.content }),
  });
}

// --- Whole-record writes (import / intake save / start from scratch) ---

export function useReplaceContent() {
  return useContentMutation((body: ContentIn) => putContent(body));
}

export function useImportContent() {
  return useContentMutation((file: File) => importContentYaml(file));
}

// --- Experience: roles -> groups -> bullets ---

export function useCreateRole() {
  return useContentMutation((body: RoleCreate) => createRole(body));
}

/** Mutations scoped to one role, so the role editor needs only the role. */
export function useRoleActions(roleId: string) {
  return {
    update: useContentMutation((body: RoleUpdate) => updateRole(roleId, body)),
    remove: useContentMutation(() => deleteRole(roleId)),
    createGroup: useContentMutation((body: GroupCreate) => createGroup(roleId, body)),
  };
}

/** Mutations scoped to one group (and its bullets). */
export function useGroupActions(roleId: string, groupId: string) {
  return {
    update: useContentMutation((body: GroupUpdate) => updateGroup(roleId, groupId, body)),
    remove: useContentMutation(() => deleteGroup(roleId, groupId)),
    createBullet: useContentMutation((body: BulletCreate) => createBullet(roleId, groupId, body)),
    updateBullet: useContentMutation(
      ({ bulletId, body }: { bulletId: string; body: BulletUpdate }) =>
        updateBullet(roleId, groupId, bulletId, body),
    ),
    removeBullet: useContentMutation((bulletId: string) => deleteBullet(roleId, groupId, bulletId)),
  };
}

// --- Keyed collections: taglines, skills, education ---

export function useTaglineMutations() {
  return {
    upsert: useContentMutation(({ key, text }: { key: string; text: string }) =>
      upsertTagline(key, { text }),
    ),
    remove: useContentMutation((key: string) => deleteTagline(key)),
  };
}

export function useSkillMutations() {
  return {
    upsert: useContentMutation(({ key, ...body }: SkillGroupUpdate & { key: string }) =>
      upsertSkill(key, body),
    ),
    remove: useContentMutation((key: string) => deleteSkill(key)),
  };
}

export function useEducationMutations() {
  return {
    upsert: useContentMutation(({ id, text }: { id: string; text: string }) =>
      upsertEducation(id, { text }),
    ),
    remove: useContentMutation((id: string) => deleteEducation(id)),
  };
}
