import { DashboardView } from "@/features/dashboard/components/dashboard-view";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return <DashboardView />;
}
