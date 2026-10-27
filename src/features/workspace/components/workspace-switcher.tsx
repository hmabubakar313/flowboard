"use client";

import { ChevronDownIcon } from "@/components/ui/icons";
import { DropdownMenu, MenuItem } from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "next/navigation";
import { useWorkspace } from "./workspace-provider";

export function WorkspaceSwitcher() {
  const { workspace, workspaces, setWorkspaceId } = useWorkspace();
  const router = useRouter();
  const pathname = usePathname();

  const select = (id: string) => {
    if (id === workspace.id) return;
    setWorkspaceId(id);
    // Detail pages belong to one workspace, so go somewhere that exists in the next one.
    if (pathname.split("/").length > 2) router.push("/dashboard");
  };

  return (
    <DropdownMenu
      label={`Workspace: ${workspace.name}. Switch workspace`}
      align="start"
      triggerClassName="flex h-10 w-full items-center gap-2.5 rounded-control px-2 text-left hover:bg-sunken"
      trigger={
        <>
          <span
            aria-hidden="true"
            className="bg-accent text-accent-ink rounded-control flex size-6 shrink-0 items-center justify-center text-xs font-semibold"
          >
            {workspace.name.charAt(0)}
          </span>
          <span className="min-w-0 flex-1 truncate font-semibold">{workspace.name}</span>
          <ChevronDownIcon className="text-ink-3 shrink-0" />
        </>
      }
    >
      {workspaces.map((item) => (
        <MenuItem key={item.id} checked={item.id === workspace.id} onClick={() => select(item.id)}>
          <span className="flex-1">{item.name}</span>
          <span className="text-ink-3 text-xs">{item.plan}</span>
        </MenuItem>
      ))}
    </DropdownMenu>
  );
}
