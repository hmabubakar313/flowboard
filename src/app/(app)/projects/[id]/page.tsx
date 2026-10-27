import { ProjectDetail } from "@/features/projects/components/project-detail";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Project" };

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <ProjectDetail id={id} />
    </Suspense>
  );
}
