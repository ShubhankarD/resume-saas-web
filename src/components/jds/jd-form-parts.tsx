"use client";

import type { ComponentProps } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { SheetClose } from "@/components/ui/sheet";

/** Pieces every JD create form (text / url / file) is assembled from. */

type InputProps = ComponentProps<typeof Input>;

export const FORM_CLASS = "flex flex-col gap-4";

export const FILE_INPUT_CLASS =
  "w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-slate-800 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400 dark:file:bg-slate-50 dark:file:text-slate-900";

export function MetaFields({
  idPrefix,
  title,
  company,
}: {
  idPrefix: string;
  title: InputProps;
  company: InputProps;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormField label="Title" htmlFor={`${idPrefix}-title`} hint="Optional">
        <Input id={`${idPrefix}-title`} placeholder="Staff Engineer" {...title} />
      </FormField>
      <FormField label="Company" htmlFor={`${idPrefix}-company`} hint="Optional">
        <Input id={`${idPrefix}-company`} placeholder="Acme Corp" {...company} />
      </FormField>
    </div>
  );
}

export function FormActions({
  isPending,
  testId,
  idleLabel,
  pendingLabel,
}: {
  isPending: boolean;
  testId: string;
  idleLabel: string;
  pendingLabel: string;
}) {
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      <Button type="submit" disabled={isPending} data-testid={testId}>
        {isPending ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
        {isPending ? pendingLabel : idleLabel}
      </Button>
      <SheetClose render={<Button type="button" variant="ghost" />}>Cancel</SheetClose>
    </div>
  );
}
