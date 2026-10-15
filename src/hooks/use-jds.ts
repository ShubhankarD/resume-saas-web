"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createJd, deleteJd, getJd, listJds, type CreateJdInput } from "@/lib/api/jds";
import { queryKeys } from "@/lib/query-keys";

export function useJds() {
  return useQuery({ queryKey: queryKeys.jds.all, queryFn: listJds });
}

export function useJd(jdId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.jds.detail(jdId ?? ""),
    queryFn: () => getJd(jdId as string),
    enabled: Boolean(jdId),
  });
}

export function useCreateJd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateJdInput) => createJd(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jds.all });
    },
  });
}

export function useDeleteJd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jdId: string) => deleteJd(jdId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jds.all });
    },
  });
}
