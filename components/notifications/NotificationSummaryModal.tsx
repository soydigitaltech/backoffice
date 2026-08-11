"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bell,
  MessageCircle,
  NotebookPen,
  X,
} from "lucide-react";

type NotificationSummaryModalProps = {
  open: boolean;
  onClose: () => void;
  firstName?: string;
};

export default function NotificationSummaryModal({
  open,
  onClose,
  firstName = "Jhoseline",
}: NotificationSummaryModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar resumen"
        onClick={onClose}
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
      />

      <section className="relative z-10 w-full max-w-[520px] overflow-hidden rounded-3xl border border-admin-border bg-white shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
        <div className="px-6 pb-5 pt-6 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-blue text-primary-dark">
                <Bell
                  aria-hidden="true"
                  size={20}
                  strokeWidth={1.9}
                />
              </div>

              <div>
                <p className="text-xl font-bold tracking-[-0.02em] text-admin-text">
                  Hola, {firstName} 👋
                </p>

                <p className="mt-1.5 text-sm leading-6 text-admin-text-soft">
                  Tienes actividad pendiente para revisar.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-admin-text-muted transition-colors hover:bg-admin-surface-soft hover:text-admin-text"
            >
              <X
                aria-hidden="true"
                size={18}
              />
            </button>
          </div>

          <div className="mt-6 space-y-2">
            <Link
              href="/solicitudes?estado=asignados"
              onClick={onClose}
              className="group flex items-center gap-4 rounded-2xl border border-admin-border p-4 transition-all hover:border-primary/30 hover:bg-surface-blue/20"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <MessageCircle
                  aria-hidden="true"
                  size={18}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-admin-text">
                    Mensajes de asesores
                  </p>

                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[9px] font-bold text-white">
                    2
                  </span>
                </div>

                <p className="mt-1 text-xs leading-5 text-admin-text-soft">
                  Hay conversaciones sobre solicitudes asignadas que requieren tu revisión.
                </p>
              </div>

              <ArrowRight
                aria-hidden="true"
                size={16}
                className="shrink-0 text-admin-text-muted transition-transform group-hover:translate-x-0.5"
              />
            </Link>

            <Link
              href="/solicitudes?estado=revision"
              onClick={onClose}
              className="group flex items-center gap-4 rounded-2xl border border-admin-border p-4 transition-all hover:border-primary/30 hover:bg-surface-blue/20"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF7EB] text-[#C66A00]">
                <NotebookPen
                  aria-hidden="true"
                  size={18}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-admin-text">
                    Bloc de notas
                  </p>

                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FE9806] px-1.5 text-[9px] font-bold text-white">
                    3
                  </span>
                </div>

                <p className="mt-1 text-xs leading-5 text-admin-text-soft">
                  Tienes recordatorios y pendientes internos por atender.
                </p>
              </div>

              <ArrowRight
                aria-hidden="true"
                size={16}
                className="shrink-0 text-admin-text-muted transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-admin-border bg-admin-surface-soft px-6 py-4 sm:px-7">
          <p className="text-[11px] text-admin-text-muted">
            5 pendientes en total
          </p>

          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl bg-black px-5 text-xs font-bold text-white transition-colors hover:bg-primary-dark"
          >
            Continuar
          </button>
        </div>
      </section>
    </div>
  );
}
