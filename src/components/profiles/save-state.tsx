/** Toolbar save indicator for the profile editor. */
/**
 * Honest save indicator: derived entirely from the mutation and preview
 * state that already drives the autosave cycle — no extra state, no timer.
 */
export function SaveState({ isSaving, error }: { isSaving: boolean; error: unknown }) {
  const label = error ? "Couldn't save" : isSaving ? "Saving…" : "Saved";
  return (
    <span
      aria-live="polite"
      className={
        error
          ? "text-destructive hidden text-xs font-medium sm:inline"
          : "hidden text-xs text-slate-500 sm:inline dark:text-slate-400"
      }
    >
      {label}
    </span>
  );
}
