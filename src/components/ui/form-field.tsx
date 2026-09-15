import * as React from "react";
import { cn } from "cn";

type FormFieldProps = {
  label: string;
  /** When provided, the label is rendered as a real `<label htmlFor>`. */
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  /** The control itself. */
  children: React.ReactNode;
};

const labelClassName =
  "mb-2 block text-xs font-semibold tracking-wider uppercase text-slate-600 dark:text-slate-400";

/**
 * Label + control + hint/error, using the shared form-label type style.
 *
 * When `htmlFor` is given, hint and error elements get stable ids
 * (`{htmlFor}-hint` / `{htmlFor}-error`) so callers can point the control's
 * `aria-describedby` at them.
 */
function FormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
}: FormFieldProps): React.ReactElement {
  const hintId = htmlFor && hint ? `${htmlFor}-hint` : undefined;
  const errorId = htmlFor && error ? `${htmlFor}-error` : undefined;

  const labelContent = (
    <>
      {label}
      {required ? (
        <>
          <span aria-hidden="true" className="ml-1 text-amber-600 dark:text-amber-400">
            *
          </span>
          <span className="sr-only"> (required)</span>
        </>
      ) : null}
    </>
  );

  return (
    <div data-slot="form-field" className={cn("w-full", className)}>
      {htmlFor ? (
        <label htmlFor={htmlFor} className={labelClassName}>
          {labelContent}
        </label>
      ) : (
        <span className={labelClassName}>{labelContent}</span>
      )}

      {children}

      {hint && !error ? (
        <p id={hintId} className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="mt-2 text-xs leading-relaxed font-medium text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { FormField };
