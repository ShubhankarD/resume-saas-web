import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "cn";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm text-slate-900 transition-all duration-150 outline-none",
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-900 placeholder:text-slate-400",
        "focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/15 aria-invalid:ring-4",
        "dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-100 dark:file:text-slate-100 dark:placeholder:text-slate-500",
        "dark:focus:border-amber-500 dark:focus:bg-slate-900 dark:disabled:bg-slate-900/80",
        "dark:aria-invalid:border-destructive/60 dark:aria-invalid:ring-destructive/30",
        "md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
