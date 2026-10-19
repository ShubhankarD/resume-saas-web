/** Small label-over-value stat used in the report cards. */
export function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <span className="block text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
        {label}
      </span>
      <span className="text-lg font-semibold tabular-nums">{children}</span>
    </div>
  );
}

/** A titled block inside a report card. */
export function ReportBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-medium">{title}</span>
      {children}
    </div>
  );
}

/** Muted one-line note, e.g. the "nothing to flag" state of a block. */
export function Note({ children }: { children: React.ReactNode }) {
  return <p className="text-xs leading-5 text-slate-600 dark:text-slate-400">{children}</p>;
}

/** Bulleted findings; renders `empty` instead when there are none. */
export function FindingList<T>({
  items,
  empty,
  muted = false,
  render,
}: {
  items: readonly T[];
  empty?: React.ReactNode;
  muted?: boolean;
  render: (item: T) => React.ReactNode;
}) {
  if (items.length === 0) return empty ? <Note>{empty}</Note> : null;
  return (
    <ul className={`list-inside list-disc text-xs ${muted ? "text-muted-foreground" : ""}`}>
      {items.map((item, i) => (
        <li key={i}>{render(item)}</li>
      ))}
    </ul>
  );
}
