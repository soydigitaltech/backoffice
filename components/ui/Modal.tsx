"use client";

import { X } from "lucide-react";
import { useEffect, useId } from "react";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  onClose: () => void;
};

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
};

export default function Modal({
  open,
  title,
  description,
  children,
  footer,
  size = "md",
  onClose,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
    >
      <button
        type="button"
        aria-label="Cerrar ventana"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/35 backdrop-blur-[2px]"
      />

      <section
        className={[
          "relative z-10 flex max-h-[calc(100vh-32px)] w-full flex-col overflow-hidden rounded-2xl bg-white",
          sizeClasses[size],
        ].join(" ")}
      >
        <header className="flex items-start justify-between gap-5 border-b border-admin-border px-5 py-5 sm:px-6">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="text-xl font-bold tracking-[-0.03em] text-admin-text"
            >
              {title}
            </h2>

            {description ? (
              <p
                id={descriptionId}
                className="mt-1 text-sm leading-6 text-admin-text-soft"
              >
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-admin-text-soft transition-colors hover:bg-admin-surface-soft hover:text-ink"
          >
            <X aria-hidden="true" size={20} strokeWidth={1.8} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {children}
        </div>

        {footer ? (
          <footer className="border-t border-admin-border px-5 py-4 sm:px-6">
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  );
}
