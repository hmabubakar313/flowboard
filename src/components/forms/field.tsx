import { cn } from "@/lib/utils/cn";
import { useId, type ReactElement, type ReactNode, cloneElement } from "react";

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  /** A single form control. Receives id, aria-invalid and aria-describedby. */
  children: ReactElement<{ id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string }>;
}

export function Field({
  label,
  error,
  hint,
  required,
  className,
  children,
}: FieldProps): ReactNode {
  const id = useId();
  const messageId = `${id}-message`;
  const describedBy = error || hint ? messageId : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-ink text-sm font-medium">
        {label}
        {required ? <span className="text-ink-3 font-normal"> (required)</span> : null}
      </label>
      {cloneElement(children, {
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
      })}
      {error ? (
        <p id={messageId} className="text-danger text-sm">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-ink-3 text-sm">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
