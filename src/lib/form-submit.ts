/**
 * Wraps a submit handler whose failure is already surfaced elsewhere — a
 * mutation's `error` state rendered by an `<ErrorMessage>` — so a rejection
 * means "stay open and keep the user's input" rather than an unhandled
 * promise rejection.
 *
 * react-hook-form's `handleSubmit` rethrows whatever the submit callback
 * throws; without this, every failed `await mutateAsync(…)` inside it
 * reaches the browser as an unhandled rejection (and Next's dev overlay).
 * Code after the failing `await` (reset, close, navigate) is skipped by the
 * throw, exactly as before.
 *
 * Only use it where the error really is displayed; handlers that keep their
 * own error state should catch it themselves.
 */
export function surfacedElsewhere<A extends unknown[]>(
  handler: (...args: A) => Promise<unknown>,
): (...args: A) => Promise<void> {
  return async (...args) => {
    try {
      await handler(...args);
    } catch {
      // Intentionally swallowed: see above.
    }
  };
}
