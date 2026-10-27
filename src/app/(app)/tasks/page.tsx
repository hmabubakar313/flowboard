import { PageHeader } from "@/components/ui/page";
import { TasksView } from "@/features/tasks/components/tasks-view";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Tasks" };

export default function TasksPage() {
  return (
    <>
      <PageHeader
        title="Tasks"
        description="Every task in this workspace. Change a status right from the list."
      />
      <Suspense>
        <TasksView />
      </Suspense>
    </>
  );
}
