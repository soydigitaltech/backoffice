"use client";

import {
  Ban,
  CheckCircle2,
  Power,
  Unlock,
} from "lucide-react";

import Modal from "@/components/ui/Modal";

type ConfirmDialogTone =
  | "success"
  | "warning"
  | "danger"
  | "info";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  tone?: ConfirmDialogTone;
  onCancel: () => void;
  onConfirm: () => void;
};

const toneStyles: Record<
  ConfirmDialogTone,
  {
    iconContainer: string;
    icon: React.ReactNode;
    confirmButton: string;
  }
> = {
  success: {
    iconContainer: "bg-success-bg text-success",
    icon: (
      <CheckCircle2
        aria-hidden="true"
        size={24}
        strokeWidth={1.8}
      />
    ),
    confirmButton: "bg-success text-white hover:opacity-90",
  },

  warning: {
    iconContainer: "bg-warning-bg text-warning",
    icon: (
      <Ban
        aria-hidden="true"
        size={24}
        strokeWidth={1.8}
      />
    ),
    confirmButton: "bg-accent text-ink hover:bg-accent-dark",
  },

  danger: {
    iconContainer: "bg-error-bg text-error",
    icon: (
      <Power
        aria-hidden="true"
        size={24}
        strokeWidth={1.8}
      />
    ),
    confirmButton: "bg-error text-white hover:opacity-90",
  },

  info: {
    iconContainer: "bg-surface-blue text-primary-dark",
    icon: (
      <Unlock
        aria-hidden="true"
        size={24}
        strokeWidth={1.8}
      />
    ),
    confirmButton: "bg-primary text-white hover:bg-primary-dark",
  },
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  tone = "warning",
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const styles = toneStyles[tone];

  return (
    <Modal
      open={open}
      title={title}
      size="sm"
      onClose={onCancel}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-admin-border bg-white px-5 text-sm font-bold text-admin-text transition-colors hover:bg-admin-surface-soft"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={[
              "inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-bold transition-colors",
              styles.confirmButton,
            ].join(" ")}
          >
            {confirmLabel}
          </button>
        </div>
      }
    >
      <div className="p-5 sm:p-6">
        <div
          className={[
            "flex h-12 w-12 items-center justify-center rounded-xl",
            styles.iconContainer,
          ].join(" ")}
        >
          {styles.icon}
        </div>

        <p className="mt-5 text-sm leading-6 text-admin-text-soft">
          {description}
        </p>

        <div className="mt-4 rounded-xl bg-admin-surface-soft px-4 py-3">
          <p className="text-xs leading-5 text-admin-text-soft">
            Esta acción se aplicará inmediatamente en el mock del
            backoffice.
          </p>
        </div>
      </div>
    </Modal>
  );
}
