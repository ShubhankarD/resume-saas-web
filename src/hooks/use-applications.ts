"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelApplication,
  confirmSubmitApplication,
  createApplication,
  deleteApplication,
  fetchApplicationScreenshotUrl,
  getApplication,
  isCancellableApplicationStatus,
  listApplications,
  type ApplicationCreate,
} from "@/lib/api/applications";

export const applicationsQueryKey = ["applications"] as const;
export const applicationQueryKey = (id: string) => ["applications", id] as const;

export function useApplications() {
  return useQuery({ queryKey: applicationsQueryKey, queryFn: listApplications });
}

/** Polls the job row every 3s while non-terminal — same fallback/cross-check
 * role alongside the live SSE stream as useCuration's poll (see that hook's
 * comment). Necessary here for an additional reason curation doesn't have:
 * `vnc_url`/`browser_session_id` only ever arrive via this row, never via
 * an SSE event, so the detail page can't know a browser session exists
 * without this query landing at least once after "filling". */
export function useApplication(applicationId: string | undefined) {
  return useQuery({
    queryKey: applicationQueryKey(applicationId ?? ""),
    queryFn: () => getApplication(applicationId as string),
    enabled: Boolean(applicationId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && isCancellableApplicationStatus(status) ? 3000 : false;
    },
  });
}

/** POST /api/v1/applications/ enqueues an arq task and returns immediately
 * with status "queued" — callers should navigate to the detail page and
 * let useJobProgress/useApplication track progress from there, same shape
 * as useCreateCuration. */
export function useCreateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ApplicationCreate) => createApplication(body),
    onSuccess: (data) => {
      queryClient.setQueryData(applicationQueryKey(data.id), data);
      queryClient.invalidateQueries({ queryKey: applicationsQueryKey });
    },
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) => deleteApplication(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationsQueryKey });
    },
  });
}

export function useCancelApplication(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cancelApplication(applicationId),
    onSuccess: (data) => {
      queryClient.setQueryData(applicationQueryKey(applicationId), data);
      queryClient.invalidateQueries({ queryKey: applicationsQueryKey });
    },
  });
}

/** Only meaningful from status "awaiting_review" — the backend no-ops
 * otherwise (see confirm_submit_application's docstring), so the detail
 * page only renders this action when that's the current status rather than
 * relying on the no-op alone. */
export function useConfirmSubmitApplication(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => confirmSubmitApplication(applicationId),
    onSuccess: (data) => {
      queryClient.setQueryData(applicationQueryKey(applicationId), data);
      queryClient.invalidateQueries({ queryKey: applicationsQueryKey });
    },
  });
}

/**
 * On-demand fallback for when the live VNC iframe won't load (blueprint's
 * own F7 plan flags "a container that can take a few seconds to become
 * reachable" as the thing to expect/handle). Deliberately NOT a polling
 * loop — `apply_runner` only writes a new frame periodically and the
 * screenshot is a fallback path, not the primary one, so this fetches once
 * per explicit `refresh()` call (the detail page wires that to an "iframe
 * failed to load" handler and a manual retry button) rather than adding a
 * background timer whose cadence would just be a guess.
 *
 * Manages the object-URL lifetime itself: revokes the previous URL before
 * creating a new one, and on unmount, so a page that calls refresh()
 * repeatedly (or navigates away) never leaks blob URLs.
 */
export function useApplicationScreenshot(applicationId: string) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const urlRef = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const next = await fetchApplicationScreenshotUrl(applicationId);
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = next;
      setUrl(next);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  return { url, error, isLoading, refresh };
}
