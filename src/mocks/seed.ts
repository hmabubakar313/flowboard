import type { Activity } from "@/features/activity/schemas";
import type { ProjectStatus } from "@/features/projects/schemas";
import type { Task, TaskPriority, TaskStatus } from "@/features/tasks/schemas";
import { addDays, today } from "@/lib/utils/dates";
import type { Db, ProjectRecord } from "./db";

const NORTHWIND = "w_northwind";
const HARBOR = "w_harbor";

const AMARA = "u_amara";
const TOMAS = "u_tomas";
const PRIYA = "u_priya";
const JONAS = "u_jonas";
const MEI = "u_mei";
const DANIEL = "u_daniel";

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

export function createSeed(): Db {
  const now = today();
  let taskNumber = 100;

  const projects: ProjectRecord[] = [];
  const project = (
    id: string,
    workspaceId: string,
    name: string,
    status: ProjectStatus,
    deadlineOffset: number | null,
    ownerId: string,
    description: string,
    age: number,
  ) => {
    projects.push({
      id,
      workspaceId,
      name,
      description,
      status,
      deadline: deadlineOffset === null ? null : addDays(now, deadlineOffset),
      ownerId,
      createdAt: hoursAgo(age + 200),
      updatedAt: hoursAgo(age),
    });
  };

  project(
    "p_portal",
    NORTHWIND,
    "Customer Portal Redesign",
    "active",
    21,
    AMARA,
    "Rebuild the customer-facing portal on the new design system: invoices, usage, and team management.",
    3,
  );
  project(
    "p_billing",
    NORTHWIND,
    "Billing Service Migration",
    "active",
    9,
    JONAS,
    "Move subscription billing from the legacy monolith to the standalone billing service without downtime.",
    1,
  );
  project(
    "p_mobile",
    NORTHWIND,
    "Mobile App v2.4",
    "planning",
    45,
    PRIYA,
    "Offline mode, push notification preferences, and the accessibility fixes from the Q3 audit.",
    30,
  );
  project(
    "p_audit",
    NORTHWIND,
    "Design System Audit",
    "on_hold",
    30,
    MEI,
    "Inventory duplicated components across products and agree a consolidation plan. Paused until Portal ships.",
    120,
  );
  project(
    "p_email",
    NORTHWIND,
    "Onboarding Email Flow",
    "completed",
    -6,
    DANIEL,
    "Redesigned the five-step onboarding sequence and added delivery monitoring.",
    150,
  );
  project(
    "p_site",
    HARBOR,
    "Marketing Site Refresh",
    "active",
    14,
    AMARA,
    "New homepage, pricing page, and case studies for the Harbor Studio site.",
    8,
  );

  const tasks: Task[] = [];
  const task = (
    projectId: string,
    title: string,
    status: TaskStatus,
    priority: TaskPriority,
    dueOffset: number | null,
    assigneeId: string | null,
    description: string,
    age: number,
  ) => {
    const workspaceId = projects.find((p) => p.id === projectId)?.workspaceId ?? NORTHWIND;
    tasks.push({
      id: `t_${taskNumber}`,
      workspaceId,
      projectId,
      number: taskNumber++,
      title,
      description,
      status,
      priority,
      dueDate: dueOffset === null ? null : addDays(now, dueOffset),
      assigneeId,
      createdAt: hoursAgo(age + 72),
      updatedAt: hoursAgo(age),
    });
  };

  // Customer Portal Redesign
  task(
    "p_portal",
    "Design invoice list with filters and download",
    "done",
    "medium",
    -4,
    MEI,
    "Covers date range, status, and PDF download. Handoff is in the shared file.",
    70,
  );
  task(
    "p_portal",
    "Build invoice list page",
    "in_review",
    "high",
    2,
    TOMAS,
    "Use the shared table primitives. Pagination is server-side.",
    6,
  );
  task(
    "p_portal",
    "Usage dashboard: empty and error states",
    "in_progress",
    "medium",
    5,
    PRIYA,
    "Needs designs for accounts with no usage yet.",
    2,
  );
  task(
    "p_portal",
    "Team management: invite flow",
    "todo",
    "high",
    8,
    TOMAS,
    "Invite by email, role selection, resend and revoke.",
    20,
  );
  task(
    "p_portal",
    "Migrate session handling to new auth cookies",
    "in_progress",
    "urgent",
    -1,
    AMARA,
    "Blocked on the cookie domain change in infrastructure. Needs sign-off before Friday.",
    4,
  );
  task(
    "p_portal",
    "Accessibility pass on portal navigation",
    "todo",
    "medium",
    14,
    null,
    "Keyboard order, focus visibility, landmark structure.",
    40,
  );
  task(
    "p_portal",
    "Write Playwright smoke tests for sign-in",
    "todo",
    "low",
    18,
    DANIEL,
    "Cover sign-in, sign-out, and expired session.",
    50,
  );

  // Billing Service Migration
  task(
    "p_billing",
    "Dual-write subscription changes to new service",
    "done",
    "urgent",
    -8,
    JONAS,
    "Feature flagged. Running in shadow mode in production.",
    150,
  );
  task(
    "p_billing",
    "Backfill historical invoices",
    "in_progress",
    "high",
    3,
    JONAS,
    "About 40% complete. Rate limited to protect the primary database.",
    5,
  );
  task(
    "p_billing",
    "Reconcile proration differences",
    "in_review",
    "urgent",
    1,
    PRIYA,
    "Three customers show a difference of under 1 EUR. Review the rounding rules.",
    8,
  );
  task(
    "p_billing",
    "Cutover runbook and rollback plan",
    "todo",
    "high",
    6,
    AMARA,
    "Needs review from support and finance.",
    30,
  );
  task(
    "p_billing",
    "Update webhook consumers",
    "todo",
    "medium",
    7,
    TOMAS,
    "Three internal consumers still read the legacy event format.",
    26,
  );
  task(
    "p_billing",
    "Alert on payment failure spike",
    "todo",
    "medium",
    null,
    null,
    "Page on-call when failures exceed 3x the weekly baseline.",
    60,
  );
  task(
    "p_billing",
    "Load test checkout against new service",
    "in_progress",
    "high",
    4,
    DANIEL,
    "Target 200 requests per second with p95 under 400 ms.",
    12,
  );

  // Mobile App v2.4
  task(
    "p_mobile",
    "Spike: offline queue for form submissions",
    "in_progress",
    "medium",
    12,
    PRIYA,
    "Evaluate IndexedDB-backed queue versus a sync library.",
    10,
  );
  task(
    "p_mobile",
    "Notification preferences screen",
    "todo",
    "medium",
    25,
    MEI,
    "Group by channel; respect OS-level permission state.",
    48,
  );
  task(
    "p_mobile",
    "Fix VoiceOver focus order on checkout",
    "todo",
    "high",
    15,
    TOMAS,
    "From the Q3 audit, finding A-14.",
    36,
  );
  task(
    "p_mobile",
    "Raise minimum supported OS versions",
    "todo",
    "low",
    null,
    null,
    "Check analytics before deciding.",
    90,
  );
  task("p_mobile", "Draft release notes", "todo", "low", 40, null, "", 100);

  // Design System Audit
  task(
    "p_audit",
    "Inventory button variants across products",
    "done",
    "medium",
    -20,
    MEI,
    "Found 14 distinct variants; 6 are unused.",
    400,
  );
  task(
    "p_audit",
    "Inventory form inputs",
    "in_progress",
    "medium",
    20,
    MEI,
    "Paused with the project.",
    200,
  );
  task("p_audit", "Propose token naming scheme", "todo", "low", null, null, "", 220);

  // Onboarding Email Flow
  task(
    "p_email",
    "Write copy for the five onboarding emails",
    "done",
    "medium",
    -30,
    DANIEL,
    "",
    600,
  );
  task(
    "p_email",
    "Set up bounce and complaint monitoring",
    "done",
    "high",
    -14,
    JONAS,
    "Alerts go to the growth channel.",
    380,
  );
  task(
    "p_email",
    "Verify rendering in major mail clients",
    "done",
    "medium",
    -9,
    PRIYA,
    "Tested in Gmail, Outlook, and Apple Mail.",
    260,
  );
  task("p_email", "Retire the old welcome email", "done", "low", -7, DANIEL, "", 190);

  // Marketing Site Refresh (Harbor Studio)
  task(
    "p_site",
    "Homepage hero and layout",
    "in_progress",
    "high",
    4,
    AMARA,
    "Two layout options to review on Thursday.",
    5,
  );
  task("p_site", "Pricing page copy", "todo", "medium", 9, null, "", 30);
  task("p_site", "Collect three case study quotes", "todo", "low", 12, AMARA, "", 44);
  task("p_site", "Set up analytics events", "done", "medium", -2, AMARA, "", 90);

  const activity: Activity[] = [
    {
      id: "a_1",
      workspaceId: NORTHWIND,
      actorId: TOMAS,
      verb: "moved",
      entityType: "task",
      entityName: "Build invoice list page",
      detail: "to In review",
      createdAt: hoursAgo(6),
    },
    {
      id: "a_2",
      workspaceId: NORTHWIND,
      actorId: PRIYA,
      verb: "moved",
      entityType: "task",
      entityName: "Reconcile proration differences",
      detail: "to In review",
      createdAt: hoursAgo(8),
    },
    {
      id: "a_3",
      workspaceId: NORTHWIND,
      actorId: DANIEL,
      verb: "created",
      entityType: "task",
      entityName: "Load test checkout against new service",
      detail: null,
      createdAt: hoursAgo(12),
    },
    {
      id: "a_4",
      workspaceId: NORTHWIND,
      actorId: AMARA,
      verb: "updated",
      entityType: "task",
      entityName: "Migrate session handling to new auth cookies",
      detail: "priority set to Urgent",
      createdAt: hoursAgo(26),
    },
    {
      id: "a_5",
      workspaceId: NORTHWIND,
      actorId: JONAS,
      verb: "updated",
      entityType: "project",
      entityName: "Billing Service Migration",
      detail: "deadline changed",
      createdAt: hoursAgo(30),
    },
    {
      id: "a_6",
      workspaceId: NORTHWIND,
      actorId: MEI,
      verb: "completed",
      entityType: "task",
      entityName: "Design invoice list with filters and download",
      detail: null,
      createdAt: hoursAgo(70),
    },
    {
      id: "a_7",
      workspaceId: NORTHWIND,
      actorId: PRIYA,
      verb: "created",
      entityType: "project",
      entityName: "Mobile App v2.4",
      detail: null,
      createdAt: hoursAgo(200),
    },
    {
      id: "a_8",
      workspaceId: HARBOR,
      actorId: AMARA,
      verb: "moved",
      entityType: "task",
      entityName: "Homepage hero and layout",
      detail: "to In progress",
      createdAt: hoursAgo(5),
    },
  ];

  return {
    version: 1,
    currentUserId: AMARA,
    members: [
      {
        id: AMARA,
        name: "Amara Okafor",
        email: "amara@northwind.example",
        role: "Engineering lead",
      },
      {
        id: TOMAS,
        name: "Tomás Herrera",
        email: "tomas@northwind.example",
        role: "Frontend engineer",
      },
      {
        id: PRIYA,
        name: "Priya Nair",
        email: "priya@northwind.example",
        role: "Full-stack engineer",
      },
      {
        id: JONAS,
        name: "Jonas Lindqvist",
        email: "jonas@northwind.example",
        role: "Backend engineer",
      },
      { id: MEI, name: "Mei Tanaka", email: "mei@northwind.example", role: "Product designer" },
      { id: DANIEL, name: "Daniel Osei", email: "daniel@northwind.example", role: "QA engineer" },
    ],
    workspaces: [
      { id: NORTHWIND, name: "Northwind Labs", plan: "Team" },
      { id: HARBOR, name: "Harbor Studio", plan: "Free" },
    ],
    projects,
    tasks,
    activity,
    nextTaskNumber: taskNumber,
  };
}
