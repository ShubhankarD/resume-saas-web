"use client";

import { useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { useSkillMutations } from "@/hooks/use-content";
import { contentKeySchema } from "@/lib/domain/content-key";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ErrorMessage } from "@/components/content/error-message";

const createSchema = z.object({
  key: contentKeySchema(),
  label: z.string().min(1, "Label is required").max(100),
  text: z.string().min(1, "Text is required").max(500),
});
type CreateValues = z.infer<typeof createSchema>;

export function SkillCreateSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const fieldId = useId();
  const { upsert } = useSkillMutations();
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
            Add skill group
          </Button>
        }
      />
      <SheetContent className="max-w-lg">
        <SheetHeader>
          <SheetTitle>Add a skill group</SheetTitle>
        </SheetHeader>
        <form
          onSubmit={handleSubmit(async (values) => {
            await upsert.mutateAsync(values);
            reset();
            onOpenChange(false);
          })}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Key"
              htmlFor={`${fieldId}-key`}
              error={errors.key?.message}
              required
              hint="Lowercase letters, numbers, - or _"
            >
              <Input
                id={`${fieldId}-key`}
                placeholder="cloud"
                aria-invalid={errors.key ? true : undefined}
                {...register("key")}
              />
            </FormField>

            <FormField
              label="Label"
              htmlFor={`${fieldId}-label`}
              error={errors.label?.message}
              required
              hint="Shown on the resume."
            >
              <Input
                id={`${fieldId}-label`}
                placeholder="Cloud & Infrastructure"
                aria-invalid={errors.label ? true : undefined}
                {...register("label")}
              />
            </FormField>
          </div>

          <FormField
            label="Skills"
            htmlFor={`${fieldId}-text`}
            error={errors.text?.message}
            required
            hint="Separate skills with commas."
          >
            <Input
              id={`${fieldId}-text`}
              placeholder="GCP, AWS, Terraform"
              aria-invalid={errors.text ? true : undefined}
              {...register("text")}
            />
          </FormField>

          <ErrorMessage error={upsert.error} />

          <Button type="submit" variant="cta" disabled={isSubmitting}>
            {isSubmitting ? "Adding…" : "Add skill group"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
