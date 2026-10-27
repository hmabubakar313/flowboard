"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

/** Demo-only controls for the in-browser mock API. Loaded lazily so http mode never ships them. */
export function MockControls() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [failing, setFailing] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);

  useEffect(() => {
    void import("@/mocks/controls").then((m) => setFailing(m.isFailureSimulated()));
  }, []);

  const toggleFailure = async (enabled: boolean) => {
    setFailing(enabled);
    (await import("@/mocks/controls")).setFailureSimulated(enabled);
    toast.success(enabled ? "Requests will now fail" : "Requests are back to normal");
  };

  const reset = async () => {
    (await import("@/mocks/controls")).resetMockData();
    await queryClient.invalidateQueries();
    setConfirmingReset(false);
    toast.success("Demo data restored");
  };

  return (
    <div className="flex flex-col gap-5">
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={failing}
          onChange={(event) => void toggleFailure(event.target.checked)}
          className="accent-accent mt-1 size-4"
        />
        <span>
          <span className="block font-medium">Simulate network failures</span>
          <span className="text-ink-2 block">
            Projects, tasks and activity requests fail, so you can see error states and optimistic
            updates roll back.
          </span>
        </span>
      </label>
      <div>
        <Button onClick={() => setConfirmingReset(true)}>Reset demo data</Button>
        <p className="text-ink-2 mt-1.5">
          Discards your changes and restores the original sample data.
        </p>
      </div>
      <ConfirmDialog
        open={confirmingReset}
        title="Reset demo data?"
        description="All projects and tasks you created or edited will be replaced with the original sample data."
        confirmLabel="Reset data"
        onConfirm={() => void reset()}
        onCancel={() => setConfirmingReset(false)}
      />
    </div>
  );
}
