"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useCreateJd } from "@/hooks/use-jds";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { JD_CREATE_MODES, type JdMode } from "./jd-create-forms";

const MODES = Object.keys(JD_CREATE_MODES) as JdMode[];

export function JdCreateSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createJd = useCreateJd();
  const [mode, setMode] = useState<JdMode>("text");
  const { Form } = JD_CREATE_MODES[mode];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger render={<Button variant="cta" data-testid="new-jd-button" />}>
        <Plus aria-hidden="true" />
        New job description
      </SheetTrigger>
      <SheetContent className="max-w-lg" closeLabel="Close new job description panel">
        <SheetHeader>
          <SheetTitle>Add a job description</SheetTitle>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Paste the text, paste a job-posting URL, or upload a file — pick one input mode.
          </p>
        </SheetHeader>

        <div
          role="group"
          aria-label="Input mode"
          className="flex flex-wrap gap-1 rounded-lg bg-slate-100/70 p-1 dark:bg-slate-950/40"
        >
          {MODES.map((m) => (
            <Button
              key={m}
              type="button"
              size="sm"
              variant={mode === m ? "default" : "ghost"}
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              data-testid={`jd-mode-${m}`}
            >
              {JD_CREATE_MODES[m].label}
            </Button>
          ))}
        </div>

        <Form
          onSubmit={createJd.mutateAsync}
          isPending={createJd.isPending}
          error={createJd.error}
          onCreated={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
