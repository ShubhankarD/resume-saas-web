/**
 * Keeps the editor shell's shape while the profile and content queries
 * resolve, so the page doesn't jump once data arrives.
 */
export function EditorSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading profile">
      <div className="flex h-14 items-center justify-between gap-3">
        <div className="h-5 w-48 max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="flex h-11 items-center gap-6 border-b border-slate-200/80 dark:border-slate-800">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,45fr)_minmax(0,55fr)] lg:gap-8">
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
        <div className="h-[70vh] animate-pulse rounded-xl border border-slate-200/80 bg-slate-100/70 lg:h-[calc(100vh-6rem)] dark:border-slate-800 dark:bg-slate-950" />
      </div>
    </div>
  );
}
