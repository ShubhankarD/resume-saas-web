"use client";

import { Menu } from "@base-ui/react/menu";
import { LogOut } from "lucide-react";
import { cn } from "cn";

/**
 * Account control for the top application header (spec §6: the right side of
 * the header carries account/avatar and the user menu — never page-specific
 * actions). The trigger is the avatar initial; the popup restates who is
 * signed in and holds the session-level actions.
 */
export function UserMenu({
  displayName,
  email,
  onLogout,
}: {
  displayName?: string;
  email?: string;
  onLogout: () => void;
}) {
  const label = (displayName || email || "").trim();
  const initial = label.charAt(0).toUpperCase() || "?";

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={label ? `Account menu for ${label}` : "Account menu"}
        className={cn(
          "focus-visible:ring-ring/40 focus-visible:border-ring flex size-9 shrink-0 items-center justify-center rounded-md border border-transparent transition-colors outline-none focus-visible:ring-2",
          "hover:bg-slate-100 aria-expanded:bg-slate-100 dark:hover:bg-slate-800 dark:aria-expanded:bg-slate-800",
        )}
      >
        <span
          aria-hidden
          className="bg-muted text-foreground flex size-7 items-center justify-center rounded-full text-xs font-semibold"
        >
          {initial}
        </span>
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={8} className="z-50">
          <Menu.Popup className="border-border bg-card data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 w-56 rounded-lg border p-1 shadow-lg outline-none">
            {(displayName || email) && (
              <div className="flex flex-col gap-0.5 px-2 py-2">
                {displayName && (
                  <span className="text-foreground truncate text-sm font-medium">
                    {displayName}
                  </span>
                )}
                {email && <span className="text-muted-foreground truncate text-xs">{email}</span>}
              </div>
            )}
            <Menu.Separator className="bg-border -mx-1 my-1 h-px" />
            <Menu.Item
              onClick={onLogout}
              className="text-foreground data-highlighted:bg-muted flex h-9 cursor-default items-center gap-2 rounded-md px-2 text-sm font-medium outline-none select-none"
            >
              <LogOut className="size-4 shrink-0" aria-hidden />
              Log out
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
