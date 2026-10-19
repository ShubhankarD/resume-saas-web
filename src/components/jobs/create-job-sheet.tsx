"use client";

import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ErrorMessage } from "@/components/content/error-message";

/** Styling for the plain `<select>`s in the job create sheets. */
export const JOB_SELECT_CLASS =
  "border-border bg-card h-10 w-full rounded-lg border px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10";

/**
 * The "start a job" side sheet shared by AI curation and apply: a trigger
 * button, a titled panel, the job-specific fields as `children`, the
 * mutation error, and Cancel / submit. The caller owns the form submit
 * handler (so it can navigate to the new job) and the open state.
 */
export function CreateJobSheet({
  open,
  onOpenChange,
  triggerLabel,
  triggerTestId,
  title,
  description,
  onSubmit,
  isPending,
  error,
  idleLabel,
  pendingLabel,
  submitTestId,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerLabel: string;
  triggerTestId: string;
  title: string;
  description: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
  error: unknown;
  idleLabel: string;
  pendingLabel: string;
  submitTestId: string;
  children: React.ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger render={<Button variant="cta" />} data-testid={triggerTestId}>
        <Plus aria-hidden="true" />
        {triggerLabel}
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          {children}

          <ErrorMessage error={error} />

          <div className="flex items-center justify-end gap-2 pt-1">
            <SheetClose render={<Button type="button" variant="outline" />}>Cancel</SheetClose>
            <Button type="submit" variant="cta" disabled={isPending} data-testid={submitTestId}>
              {isPending && <Loader2 aria-hidden="true" className="animate-spin" />}
              {isPending ? pendingLabel : idleLabel}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
