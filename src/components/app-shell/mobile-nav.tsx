"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { cn } from "cn";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Wordmark } from "@/components/wordmark";
import { SidebarNav } from "@/components/app-shell/sidebar-nav";

/**
 * Mobile navigation (spec §37): below `md` the sidebar becomes a drawer, while
 * the top header stays compact so the page's own primary action keeps its
 * place. The drawer closes whenever the route changes, so tapping a
 * destination never leaves the overlay stranded on the new page.
 */
export function MobileNav({
  displayName,
  email,
  onLogout,
}: {
  displayName?: string;
  email?: string;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open navigation menu"
        className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "md:hidden")}
      >
        <Menu className="size-[18px]" />
      </SheetTrigger>

      <SheetContent side="left" className="flex w-[16.5rem] max-w-[85vw] flex-col gap-0 p-0">
        <SheetHeader className="border-border flex h-14 shrink-0 flex-row items-center border-b px-4">
          <SheetTitle className="text-base font-normal">
            <Link href="/dashboard" onClick={() => setOpen(false)}>
              <Wordmark className="text-lg" />
            </Link>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Navigate between the main sections of resumeaid.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </div>

        <div className="border-border flex flex-col gap-2 border-t p-3">
          {(displayName || email) && (
            <div className="flex min-w-0 flex-col gap-0.5 px-2">
              {displayName && (
                <span className="text-foreground truncate text-sm font-medium">{displayName}</span>
              )}
              {email && <span className="text-muted-foreground truncate text-xs">{email}</span>}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground h-9 justify-start gap-2 text-sm"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            <LogOut className="size-4" />
            Log out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
