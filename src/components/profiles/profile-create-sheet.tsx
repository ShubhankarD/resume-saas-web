"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus } from "lucide-react";
import { useCreateProfile } from "@/hooks/use-profiles";
import { surfacedElsewhere } from "@/lib/form-submit";
import { newProfileDraft, profileNameSchema } from "@/lib/domain/profile-defaults";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ErrorMessage } from "@/components/content/error-message";

const createSchema = z.object({
  name: profileNameSchema,
  label: z.string().min(1, "Label is required").max(255),
});
type CreateForm = z.infer<typeof createSchema>;

export function ProfileCreateSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createProfile = useCreateProfile();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateForm>({ resolver: zodResolver(createSchema) });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger render={<Button variant="cta" data-testid="new-profile-button" />}>
        <Plus aria-hidden="true" />
        New profile
      </SheetTrigger>
      <SheetContent closeLabel="Close new profile panel">
        <SheetHeader>
          <SheetTitle>New profile</SheetTitle>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            A profile is one tailored resume — give it a short id and a human label you&apos;ll
            recognise later.
          </p>
        </SheetHeader>
        <form
          onSubmit={surfacedElsewhere(
            handleSubmit(async (values) => {
              const profile = await createProfile.mutateAsync(newProfileDraft(values));
              reset();
              onOpenChange(false);
              window.location.href = `/profiles/${profile.id}`;
            }),
          )}
          className="flex flex-col gap-4"
        >
          <FormField
            label="Name"
            htmlFor="new-profile-name"
            hint="Lowercase id, unique — letters, numbers, - or _"
            error={errors.name?.message}
            required
          >
            <Input id="new-profile-name" placeholder="google-fde" {...register("name")} />
          </FormField>

          <FormField
            label="Label"
            htmlFor="new-profile-label"
            hint="Shown across the app"
            error={errors.label?.message}
            required
          >
            <Input id="new-profile-label" placeholder="Google FDE" {...register("label")} />
          </FormField>

          <ErrorMessage error={createProfile.error} />

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              type="submit"
              disabled={createProfile.isPending}
              data-testid="create-profile-submit"
            >
              {createProfile.isPending ? (
                <Loader2 aria-hidden="true" className="animate-spin" />
              ) : null}
              {createProfile.isPending ? "Creating…" : "Create profile"}
            </Button>
            <SheetClose render={<Button type="button" variant="ghost" />}>Cancel</SheetClose>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
