"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { MenuIcon } from "@/components/ui/icons";
import { UserMenu } from "@/features/workspace/components/user-menu";
import { WorkspaceProvider } from "@/features/workspace/components/workspace-provider";
import { useState, type ReactNode } from "react";
import { Breadcrumbs } from "./breadcrumbs";
import { SidebarNav } from "./sidebar-nav";

function Shell({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-dvh lg:pl-[var(--sidebar-width)]">
      <a
        href="#main"
        className="bg-surface text-ink focus:shadow-pop rounded-control fixed top-2 left-2 z-[70] -translate-y-16 px-3 py-2 font-medium focus:translate-y-0"
      >
        Skip to content
      </a>

      <aside className="border-line bg-canvas fixed inset-y-0 left-0 z-30 hidden w-[var(--sidebar-width)] border-r lg:block">
        <SidebarNav />
      </aside>

      <Dialog
        open={navOpen}
        onClose={() => setNavOpen(false)}
        title="Navigation"
        variant="drawer"
        hideTitle
      >
        <div className="bg-canvas flex-1">
          <SidebarNav onNavigate={() => setNavOpen(false)} />
        </div>
      </Dialog>

      <header className="border-line bg-canvas/95 sticky top-0 z-20 flex h-[var(--topbar-height)] items-center gap-2 border-b px-3 backdrop-blur-sm sm:px-6">
        <Button
          variant="ghost"
          size="sm"
          className="w-8 px-0 lg:hidden"
          aria-label="Open navigation"
          onClick={() => setNavOpen(true)}
        >
          <MenuIcon />
        </Button>
        <div className="min-w-0 flex-1">
          <Breadcrumbs />
        </div>
        <UserMenu />
      </header>

      <main id="main" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <WorkspaceProvider>
      <Shell>{children}</Shell>
    </WorkspaceProvider>
  );
}
