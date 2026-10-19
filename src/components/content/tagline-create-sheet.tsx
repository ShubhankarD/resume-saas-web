"use client";

import { useId } from "react";
import { useForm } from "react-hook-form";
import { surfacedElsewhere } from "@/lib/form-submit";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { useTaglineMutations } from "@/hooks/use-content";
import { contentKeySchema } from "@/lib/domain/content-key";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ErrorMessage } from "@/components/content/error-message";

function makeCreateSchema(existingKeys: readonly string[]) {
  return z.object({
    key: contentKeySchema("Key is required", existingKeys),
    text: z.string().min(1, "Text is required").max(500),
  });
}
type CreateValues = z.infer<ReturnType<typeof makeCreateSchema>>;

export function TaglineCreateSheet({
  existingKeys,
  open,
  onOpenChange,
}: {
  existingKeys: readonly string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const fieldId = useId();
  const { upsert } = useTaglineMutations();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateValues>({ resolver: zodResolver(makeCreateSchema(existingKeys)) });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger
        render={
          <Button variant="cta">
            <Plus aria-hidden="true" className="size-4" />
            Add tagline
          </Button>
        }
      />
      <SheetContent className="max-w-lg">
        <SheetHeader>
          <SheetTitle>Add a tagline</SheetTitle>
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
            label="Key"
            htmlFor={`${fieldId}-key`}
            error={errors.key?.message}
            required
            hint="Lowercase letters, numbers, - or _ — e.g. “default”."
          >
            <Input
              id={`${fieldId}-key`}
              placeholder="default"
              aria-invalid={errors.key ? true : undefined}
              {...register("key")}
            />
          </FormField>

          <FormField
            label="Tagline"
            htmlFor={`${fieldId}-text`}
            error={errors.text?.message}
            required
          >
            <Textarea
              id={`${fieldId}-text`}
              placeholder="Cloud platform engineer who turns migrations into products."
              aria-invalid={errors.text ? true : undefined}
              {...register("text")}
            />
          </FormField>

          <ErrorMessage error={upsert.error} />

          <Button type="submit" variant="cta" disabled={isSubmitting}>
            {isSubmitting ? "Adding…" : "Add tagline"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
