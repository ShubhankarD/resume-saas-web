import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "cn";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-[color,background-color,border-color,box-shadow] duration-150 ease-out outline-none",
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-900 placeholder:text-slate-400",
        "hover:border-slate-300",
        "focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15",
        "dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:file:text-slate-100 dark:placeholder:text-slate-500",
        "dark:hover:border-slate-700 dark:focus:border-slate-600 dark:focus:ring-white/10 dark:disabled:bg-slate-900/80",
        "dark:aria-invalid:border-destructive/60 dark:aria-invalid:ring-destructive/30",
        "md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
