"use client";

import {
  Ban,
  CheckCircle2,
  Eye,
  MoreHorizontal,
  Power,
  Unlock,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import UserDetailModal from "@/components/users/UserDetailModal";
import type { User } from "@/types/user";

type UserActionsProps = {
  user: User;
  onActivate: (id: string) => void;
  onBlock: (id: string) => void;
  onUnblock: (id: string) => void;
  onDeactivate: (id: string) => void;
};

type PendingAction =
  | "activate"
  | "block"
  | "unblock"
  | "deactivate"
  | null;

export default function UserActions({
  user,
  onActivate,
  onBlock,
  onUnblock,
  onDeactivate,
}: UserActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [pendingAction, setPendingAction] =
    useState<PendingAction>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const openConfirmation = (
    action: Exclude<PendingAction, null>,
  ) => {
    setPendingAction(action);
    setIsOpen(false);
  };

  const closeConfirmation = () => {
    setPendingAction(null);
  };

  const executeAction = () => {
    switch (pendingAction) {
      case "activate":
        onActivate(user.id);
        break;

      case "block":
        onBlock(user.id);
        break;

      case "unblock":
        onUnblock(user.id);
        break;

      case "deactivate":
        onDeactivate(user.id);
        break;

      default:
        return;
    }

    closeConfirmation();
  };

  const confirmationContent = {
    activate: {
      title: "Activar usuario",
      description: `Se habilitará el acceso de ${user.fullName} al backoffice de Kivo.`,
      confirmLabel: "Activar usuario",
      tone: "success" as const,
    },
    block: {
      title: "Bloquear usuario",
      description: `${user.fullName} no podrá acceder temporalmente al backoffice hasta que su cuenta sea desbloqueada.`,
      confirmLabel: "Bloquear usuario",
      tone: "warning" as const,
    },
    unblock: {
      title: "Desbloquear usuario",
      description: `${user.fullName} recuperará el acceso al backoffice de Kivo.`,
      confirmLabel: "Desbloquear usuario",
      tone: "info" as const,
    },
    deactivate: {
      title: "Desactivar usuario",
      description: `La cuenta de ${user.fullName} quedará inactiva y no podrá iniciar sesión.`,
      confirmLabel: "Desactivar usuario",
      tone: "danger" as const,
    },
  };

  const currentConfirmation = pendingAction
    ? confirmationContent[pendingAction]
    : null;

  return (
    <>
      <div ref={menuRef} className="relative inline-flex">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-label={`Acciones de ${user.fullName}`}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-admin-text-soft transition-colors hover:bg-admin-surface-soft hover:text-ink"
        >
          <MoreHorizontal
            aria-hidden="true"
            size={19}
            strokeWidth={1.8}
          />
        </button>

        {isOpen ? (
          <div
            role="menu"
            className="absolute right-0 top-11 z-30 w-56 rounded-2xl border border-admin-border bg-white p-2"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setShowDetail(true);
                setIsOpen(false);
              }}
              className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-admin-text transition-colors hover:bg-surface-blue"
            >
              <Eye
                aria-hidden="true"
                size={17}
                strokeWidth={1.8}
                className="text-primary-dark"
              />

              Ver detalle
            </button>

            <div className="my-2 h-px bg-admin-border" />

            {user.status === "PENDING" ||
            user.status === "INACTIVE" ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => openConfirmation("activate")}
                className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-success transition-colors hover:bg-success-bg"
              >
                <CheckCircle2
                  aria-hidden="true"
                  size={17}
                  strokeWidth={1.8}
                />

                Activar usuario
              </button>
            ) : null}

            {user.status === "ACTIVE" ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => openConfirmation("block")}
                className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-warning transition-colors hover:bg-warning-bg"
              >
                <Ban
                  aria-hidden="true"
                  size={17}
                  strokeWidth={1.8}
                />

                Bloquear usuario
              </button>
            ) : null}

            {user.status === "BLOCKED" ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => openConfirmation("unblock")}
                className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-primary-dark transition-colors hover:bg-surface-blue"
              >
                <Unlock
                  aria-hidden="true"
                  size={17}
                  strokeWidth={1.8}
                />

                Desbloquear usuario
              </button>
            ) : null}

            {user.status !== "INACTIVE" ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => openConfirmation("deactivate")}
                className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-error transition-colors hover:bg-error-bg"
              >
                <Power
                  aria-hidden="true"
                  size={17}
                  strokeWidth={1.8}
                />

                Desactivar usuario
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <UserDetailModal
        user={user}
        open={showDetail}
        onClose={() => setShowDetail(false)}
      />

      {currentConfirmation ? (
        <ConfirmDialog
          open
          title={currentConfirmation.title}
          description={currentConfirmation.description}
          confirmLabel={currentConfirmation.confirmLabel}
          tone={currentConfirmation.tone}
          onCancel={closeConfirmation}
          onConfirm={executeAction}
        />
      ) : null}
    </>
  );
}
