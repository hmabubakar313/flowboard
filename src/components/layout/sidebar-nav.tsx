"use client";

import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";
import { WorkspaceSwitcher } from "@/features/workspace/components/workspace-switcher";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-4 p-3">
      <WorkspaceSwitcher />
      <nav aria-label="Main">
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-control flex h-9 items-center gap-2.5 px-2.5 font-medium",
                    active
                      ? "bg-accent-tint text-accent"
                      : "text-ink-2 hover:bg-sunken hover:text-ink",
                  )}
                >
                  <Icon />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <p className="text-ink-3 border-line mt-auto border-t px-2.5 pt-3 text-xs">
        Demo workspace. Data is generated in your browser and never leaves it.
      </p>
    </div>
  );
}
