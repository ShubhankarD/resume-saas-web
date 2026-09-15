import * as React from "react";
import { cn } from "cn";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-[110px] w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm leading-relaxed text-slate-900 transition-all duration-150 outline-none",
        "placeholder:text-slate-400",
        "focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10",
        "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/15 aria-invalid:ring-4",
        "dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-100 dark:placeholder:text-slate-500",
        "dark:focus:border-amber-500 dark:focus:bg-slate-900 dark:disabled:bg-slate-900/80",
        "dark:aria-invalid:border-destructive/60 dark:aria-invalid:ring-destructive/30",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
