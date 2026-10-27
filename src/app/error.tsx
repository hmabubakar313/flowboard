"use client";

import { ErrorState } from "@/components/feedback/error-state";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md pt-24">
      <ErrorState
        title="Something went wrong"
        message="An unexpected error occurred. Your data hasn't been affected."
        onRetry={reset}
      />
    </div>
  );
}
