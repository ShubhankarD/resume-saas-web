"use client";

import { useId } from "react";
import { useForm } from "react-hook-form";
import { surfacedElsewhere } from "@/lib/form-submit";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { useEducationMutations } from "@/hooks/use-content";
import { contentKeySchema } from "@/lib/domain/content-key";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ErrorMessage } from "@/components/content/error-message";

const createSchema = z.object({
  id: contentKeySchema("Id is required"),
  text: z.string().min(1, "Text is required").max(500),
});
type CreateValues = z.infer<typeof createSchema>;

export function EducationCreateSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const fieldId = useId();
  const { upsert } = useEducationMutations();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateValues>({ resolver: zodResolver(createSchema) });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger
        render={
          <Button variant="cta">
            <Plus aria-hidden="true" className="size-4" />
            Add entry
          </Button>
        }
      />
      <SheetContent className="max-w-lg">
        <SheetHeader>
          <SheetTitle>Add an education entry</SheetTitle>
        </SheetHeader>
        <form
          onSubmit={surfacedElsewhere(
            handleSubmit(async (values) => {
              await upsert.mutateAsync(values);
              reset();
              onOpenChange(false);
            }),
          )}
          className="space-y-4"
        >
          <FormField
            label="Entry id"
            htmlFor={`${fieldId}-id`}
            error={errors.id?.message}
            required
            hint="Lowercase letters, numbers, - or _ — e.g. “bs-cs”."
          >
            <Input
              id={`${fieldId}-id`}
              placeholder="bs-cs"
              aria-invalid={errors.id ? true : undefined}
              {...register("id")}
            />
          </FormField>

          <FormField
            label="Entry"
            htmlFor={`${fieldId}-text`}
            error={errors.text?.message}
            required
          >
            <Textarea
              id={`${fieldId}-text`}
              placeholder="BS Computer Science, Somewhere University"
              aria-invalid={errors.text ? true : undefined}
              {...register("text")}
            />
          </FormField>

          <ErrorMessage error={upsert.error} />

          <Button type="submit" variant="cta" disabled={isSubmitting}>
            {isSubmitting ? "Adding…" : "Add entry"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
