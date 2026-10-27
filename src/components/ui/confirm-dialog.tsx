"use client";

import { Button } from "./button";
import { Dialog, DialogBody, DialogFooter } from "./dialog";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  pending?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  pending = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} title={title} dismissible={!pending}>
      <DialogBody>
        <p className="text-ink-2">{description}</p>
        {error ? (
          <p role="alert" className="text-danger mt-3 text-sm">
            {error}
          </p>
        ) : null}
      </DialogBody>
      <DialogFooter>
        <Button onClick={onCancel} disabled={pending} data-autofocus>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={pending}>
          {pending ? "Deleting…" : confirmLabel}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
