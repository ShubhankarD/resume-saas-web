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
 * Mobile navigation (spec §14): a hamburger in the header opens a left-side
 * drawer holding the same nav as the desktop sidebar, plus the signed-in
 * identity and log out. The drawer closes whenever the route changes, so
 * tapping a destination never leaves the overlay stranded on the new page.
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

      <SheetContent side="left" className="flex w-[17rem] max-w-[85vw] flex-col gap-0 p-0">
        <SheetHeader className="border-border flex h-16 shrink-0 flex-row items-center border-b px-5">
          <SheetTitle className="text-base font-normal">
            <Link href="/dashboard" onClick={() => setOpen(false)}>
              <Wordmark className="text-lg" />
            </Link>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Navigate between the main sections of resumeaid.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </div>

        <div className="border-border flex flex-col gap-3 border-t p-4">
          {(displayName || email) && (
            <div className="flex flex-col gap-0.5 px-1">
              {displayName && (
                <span className="text-foreground truncate text-sm font-medium">{displayName}</span>
              )}
              {email && <span className="text-muted-foreground truncate text-xs">{email}</span>}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground justify-start gap-2"
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
