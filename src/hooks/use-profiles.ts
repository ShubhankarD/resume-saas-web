"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProfile,
  deleteProfile,
  getProfile,
  listProfiles,
  previewProfile,
  updateProfile,
  type ProfileWrite,
} from "@/lib/api/profiles";
import { queryKeys } from "@/lib/query-keys";

export function useProfiles() {
  return useQuery({ queryKey: queryKeys.profiles.all, queryFn: listProfiles });
}

export function useProfile(profileId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.profiles.detail(profileId ?? ""),
    queryFn: () => getProfile(profileId as string),
    enabled: Boolean(profileId),
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ProfileWrite) => createProfile(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
    },
  });
}

/** Full-replace autosave — the editor always holds the complete
 * `ProfileWrite` shape client-side (it started from a real GET), so a full
 * `PUT` is simpler and just as correct as a partial `PATCH` for every-edit
 * autosave; `PATCH`'s `ProfilePatch` distinguishes "omitted" from
 * "explicit null" only for endpoints that send a genuinely partial body,
 * which this editor never does. */
export function useUpdateProfile(profileId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ProfileWrite) => updateProfile(profileId, body),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.profiles.detail(profileId), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
    },
  });
}

export function useDeleteProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profileId: string) => deleteProfile(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
    },
  });
}

/** Not a TanStack Query hook on purpose — the live-preview panel drives its
 * own debounce/abort lifecycle (see live-preview.tsx) and just needs the raw
 * fetch function. */
export { previewProfile };
