"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createJd, deleteJd, getJd, listJds, type CreateJdInput } from "@/lib/api/jds";

export const jdsQueryKey = ["jds"] as const;
export const jdQueryKey = (id: string) => ["jds", id] as const;

export function useJds() {
  return useQuery({ queryKey: jdsQueryKey, queryFn: listJds });
}

export function useJd(jdId: string | undefined) {
  return useQuery({
    queryKey: jdQueryKey(jdId ?? ""),
    queryFn: () => getJd(jdId as string),
    enabled: Boolean(jdId),
  });
}

export function useCreateJd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateJdInput) => createJd(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jdsQueryKey });
    },
  });
}

export function useDeleteJd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jdId: string) => deleteJd(jdId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jdsQueryKey });
    },
  });
}
