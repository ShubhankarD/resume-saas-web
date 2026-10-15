"use client";

import { Plus } from "lucide-react";
import { useCreateRole } from "@/hooks/use-content";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { RoleCreateForm } from "@/components/content/role-create-form";

export function RoleCreateSheet({
  existingIds,
  open,
  onOpenChange,
}: {
  existingIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createRole = useCreateRole();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger
        render={
          <Button variant="cta">
            <Plus aria-hidden="true" className="size-4" />
            Add role
          </Button>
        }
      />
      <SheetContent className="max-w-lg">
        <SheetHeader>
          <SheetTitle>Add a role</SheetTitle>
        </SheetHeader>
        <RoleCreateForm
          existingIds={existingIds}
          onSubmit={async (body) => {
            await createRole.mutateAsync(body);
            onOpenChange(false);
          }}
          error={createRole.error}
        />
      </SheetContent>
    </Sheet>
  );
}
