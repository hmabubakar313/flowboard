import { Button } from "@/components/ui/button";
import { AlertIcon } from "@/components/ui/icons";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = "Couldn't load this", message, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center px-6 py-12 text-center">
      <div className="bg-danger-tint text-danger mb-3 flex size-10 items-center justify-center rounded-full">
        <AlertIcon />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-ink-2 mt-1 max-w-sm">{message}</p>
      {onRetry ? (
        <Button className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
