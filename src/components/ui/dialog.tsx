"use client";

import { cn } from "@/lib/utils/cn";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "./button";
import { CloseIcon } from "./icons";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** "drawer" slides in from the left and is used for mobile navigation. */
  variant?: "modal" | "drawer";
  /** When false, Escape and backdrop clicks are ignored (e.g. while saving). */
  dismissible?: boolean;
  hideTitle?: boolean;
  children: ReactNode;
}

/**
 * Wraps the native <dialog>: focus trapping, Escape, inert background and the
 * top layer come from the platform. Elements with [data-autofocus] get initial focus.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  variant = "modal",
  dismissible = true,
  hideTitle = false,
  children,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      onCancel={(event) => {
        if (!dismissible) event.preventDefault();
      }}
      onMouseDown={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose();
      }}
      className={cn(
        "bg-surface text-ink shadow-pop max-h-dvh overflow-y-auto p-0",
        variant === "modal" &&
          "rounded-panel m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg " +
            "max-sm:mt-auto max-sm:mb-0 max-sm:w-full max-sm:max-w-none max-sm:rounded-b-none",
        variant === "drawer" && "m-0 h-dvh w-72 max-w-[85vw] rounded-none",
      )}
    >
      {open ? (
        <div className={variant === "modal" ? "flex flex-col" : "flex h-full flex-col"}>
          <header
            className={cn(
              "flex items-start justify-between gap-4",
              variant === "modal" && "border-line border-b px-5 py-4",
              variant === "drawer" && "border-line border-b px-4 py-3",
            )}
          >
            <div>
              <h2 id={titleId} className={cn("text-lg font-semibold", hideTitle && "sr-only")}>
                {title}
              </h2>
              {description ? (
                <p id={descriptionId} className="text-ink-2 mt-0.5 text-sm">
                  {description}
                </p>
              ) : null}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="-mr-1.5 w-8 px-0"
              aria-label="Close"
              onClick={onClose}
              disabled={!dismissible}
            >
              <CloseIcon />
            </Button>
          </header>
          {children}
        </div>
      ) : null}
    </dialog>
  );
}

export function DialogBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}

export function DialogFooter({ children }: { children: ReactNode }) {
  return (
    <footer className="border-line flex flex-col-reverse gap-2 border-t px-5 py-3 sm:flex-row sm:justify-end">
      {children}
    </footer>
  );
}
