"use client";

import { Avatar } from "@/components/ui/avatar";
import { PageHeader, Panel } from "@/components/ui/page";
import type { ReactNode } from "react";
import { useCurrentUser } from "../hooks";
import { MockControls } from "./mock-controls";
import { useWorkspace } from "./workspace-provider";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-ink-2">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function SettingsView() {
  const { workspace } = useWorkspace();
  const { data: user } = useCurrentUser();
  const isMock = process.env.NEXT_PUBLIC_API_MODE !== "http";

  return (
    <>
      <PageHeader title="Settings" description="Workspace and account details." />
      <div className="flex max-w-3xl flex-col gap-6">
        <Panel title="Workspace" bodyClassName="p-4">
          <dl className="flex flex-col gap-3">
            <Row label="Name">{workspace.name}</Row>
            <Row label="Plan">{workspace.plan}</Row>
          </dl>
        </Panel>

        <Panel title="Your account" bodyClassName="p-4">
          {user ? (
            <dl className="flex flex-col gap-3">
              <Row label="Name">
                <span className="inline-flex items-center gap-2">
                  <Avatar name={user.name} size="sm" /> {user.name}
                </span>
              </Row>
              <Row label="Email">{user.email}</Row>
              <Row label="Role">{user.role}</Row>
            </dl>
          ) : null}
          <p className="text-ink-3 mt-4 text-sm">
            This is a demo profile. FlowBoard has no real sign-in: nothing here is protected by
            authentication.
          </p>
        </Panel>

        {isMock ? (
          <Panel title="Demo data" bodyClassName="p-4">
            <p className="text-ink-2 mb-4">
              Data is served by a mock API and stored in this browser&apos;s localStorage. It never
              leaves your device.
            </p>
            <MockControls />
          </Panel>
        ) : null}
      </div>
    </>
  );
}
