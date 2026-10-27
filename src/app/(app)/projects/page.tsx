import { ProjectsView } from "@/features/projects/components/projects-view";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  // useSearchParams (filters live in the URL) requires a Suspense boundary.
  return (
    <Suspense>
      <ProjectsView />
    </Suspense>
  );
}
