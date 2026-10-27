import { DashboardIcon, FolderIcon, SettingsIcon, TasksIcon } from "@/components/ui/icons";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/projects", label: "Projects", icon: FolderIcon },
  { href: "/tasks", label: "Tasks", icon: TasksIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
] as const;
