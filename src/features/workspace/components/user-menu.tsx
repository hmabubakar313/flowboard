"use client";

import { Avatar } from "@/components/ui/avatar";
import { DropdownMenu, MenuItem, MenuSeparator } from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "../hooks";

export function UserMenu() {
  const { data: user } = useCurrentUser();
  if (!user) return <div aria-hidden="true" className="bg-sunken size-8 rounded-full" />;

  return (
    <DropdownMenu
      label={`Account menu for ${user.name}`}
      triggerClassName="rounded-full"
      trigger={<Avatar name={user.name} className="size-8 text-xs" />}
    >
      <div role="presentation" className="px-2.5 py-2">
        <p className="font-medium">{user.name}</p>
        <p className="text-ink-3 text-sm">{user.email}</p>
      </div>
      <MenuSeparator />
      <MenuItem href="/settings">Settings</MenuItem>
    </DropdownMenu>
  );
}
