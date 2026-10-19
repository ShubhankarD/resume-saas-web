import { RefreshCw } from "lucide-react";
import type { useApplicationScreenshot } from "@/hooks/use-applications";
import { applicationOutcomeMessage } from "@/lib/domain/application";
import { Button } from "@/components/ui/button";

export function PreparingSession() {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-center dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Preparing the browser session…
      </p>
      <p className="max-w-sm text-xs text-slate-500 dark:text-slate-400">
        This launches a real container — it usually takes a few seconds to become reachable.
      </p>
    </div>
  );
}

export function TerminalOutcome({ status }: { status: string }) {
  return (
    <div className="flex h-48 flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white text-center dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {applicationOutcomeMessage(status)}
      </p>
    </div>
  );
}

/**
 * The embedded session. `vnc_url` already carries its own per-session
 * auth token (F0-4, see plans/phase-F0-backend-prereqs.md) baked into the
 * noVNC path — this iframe needs no extra header/query wiring on top of
 * that URL.
 *
 * The container can legitimately take a few seconds to become reachable
 * after launch (the plan's own flagged risk), and a refused connection
 * doesn't reliably fire an iframe's `onError` in every browser — so the
 * fallback here is an always-visible "Trouble seeing the session?"
 * affordance, not something that only appears after a detected failure.
 */
export function LiveSession({
  vncUrl,
  screenshot,
}: {
  vncUrl: string;
  screenshot: ReturnType<typeof useApplicationScreenshot>;
}) {
  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950 dark:border-slate-800">
        <iframe
          title="Live browser session"
          src={vncUrl}
          data-testid="application-vnc-iframe"
          className="h-[70vh] w-full border-0 lg:h-[calc(100vh-16rem)]"
          allow="clipboard-read; clipboard-write"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900">
        <span className="text-slate-500 dark:text-slate-400">
          Trouble seeing the session? It can take a few seconds to connect.
        </span>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => void screenshot.refresh()}
          disabled={screenshot.isLoading}
          data-testid="refresh-screenshot-button"
        >
          <RefreshCw aria-hidden="true" className={screenshot.isLoading ? "animate-spin" : ""} />
          {screenshot.isLoading ? "Loading…" : "View last frame instead"}
        </Button>
      </div>

      {screenshot.error ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          No frame available yet — the session may still be starting.
        </p>
      ) : screenshot.url ? (
        // eslint-disable-next-line @next/next/no-img-element -- a blob: object URL, not an optimizable remote asset.
        <img
          src={screenshot.url}
          alt="Last known frame of the browser session"
          className="w-full rounded-lg border border-slate-200 dark:border-slate-800"
        />
      ) : null}
    </div>
  );
}
