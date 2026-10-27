"use client";

import { ChevronRightIcon } from "@/components/ui/icons";
import { useProject } from "@/features/projects/hooks";
import { useWorkspace } from "@/features/workspace/components/workspace-provider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

interface Crumb {
  label: string;
  href?: string;
}

function ProjectLabel({ id }: { id: string }) {
  const { data } = useProject(id);
  return <>{data?.name ?? "Project"}</>;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const { workspace } = useWorkspace();
  const [section, detailId] = pathname.split("/").filter(Boolean);
  const sectionItem = NAV_ITEMS.find((item) => item.href === `/${section}`);

  const crumbs: Crumb[] = [{ label: workspace.name }];
  if (sectionItem) {
    crumbs.push({ label: sectionItem.label, href: detailId ? sectionItem.href : undefined });
  }

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="text-ink-2 flex items-center gap-1.5 text-sm">
        {crumbs.map((crumb, index) => (
          <li
            key={crumb.label}
            className="flex min-w-0 items-center gap-1.5 max-sm:[&:first-child]:hidden"
          >
            {index > 0 ? (
              <ChevronRightIcon width={12} height={12} className="text-ink-3 max-sm:hidden" />
            ) : null}
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-ink rounded-control hover:underline">
                {crumb.label}
              </Link>
            ) : (
              <span className="truncate" aria-current={detailId ? undefined : "page"}>
                {crumb.label}
              </span>
            )}
          </li>
        ))}
        {section === "projects" && detailId ? (
          <li className="flex min-w-0 items-center gap-1.5">
            <ChevronRightIcon width={12} height={12} className="text-ink-3" />
            <span className="text-ink truncate font-medium" aria-current="page">
              <ProjectLabel id={detailId} />
            </span>
          </li>
        ) : null}
      </ol>
    </nav>
  );
}
