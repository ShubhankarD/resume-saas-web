"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Local editable copy of a server value. Initialized from the first
 * non-undefined `serverValue` and never again from a background refetch —
 * otherwise a stale server response racing an in-flight edit would clobber
 * what the user just typed.
 */
export function useDraft<T>(serverValue: T | undefined) {
  const [draft, setDraft] = useState<T | null>(null);
  const initialized = useRef(false);
  useEffect(() => {
    if (serverValue !== undefined && !initialized.current) {
      initialized.current = true;
      setDraft(serverValue);
    }
  }, [serverValue]);
  return [draft, setDraft] as const;
}

/**
 * Debounced change notifications for a value that starts `null` until
 * loaded: the first non-null value goes to `onInitial` immediately (it
 * came from the server, so it's already persisted), and every later change
 * goes to `onChange` once `delayMs` passes without a newer change.
 *
 * Callbacks are read through a ref, so callers can pass inline functions
 * without re-arming the timer on every render.
 */
export function useDebouncedChanges<T>(
  value: T | null,
  {
    delayMs,
    onInitial,
    onChange,
  }: { delayMs: number; onInitial?: (value: T) => void; onChange: (value: T) => void },
) {
  const callbacks = useRef({ onInitial, onChange });
  callbacks.current = { onInitial, onChange };
  const seenInitial = useRef(false);

  useEffect(() => {
    if (value === null) return;
    if (!seenInitial.current) {
      seenInitial.current = true;
      callbacks.current.onInitial?.(value);
      return;
    }
    const timer = setTimeout(() => callbacks.current.onChange(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
}

/**
 * Guards against out-of-order async responses (a slow request from an
 * earlier edit resolving after a faster, more recent one). Call `begin()`
 * when starting a request; the returned `isLatest()` is true only while no
 * newer request has begun since.
 */
export function useLatestRequest() {
  const seq = useRef(0);
  return useCallback(() => {
    const mine = ++seq.current;
    return () => mine === seq.current;
  }, []);
}
