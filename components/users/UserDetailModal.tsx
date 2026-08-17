"use client";

import {
  CalendarDays,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";

import Modal from "@/components/ui/Modal";
import { useUsers } from "@/hooks/useUsers";
import {
  USER_ROLE_LABELS,
  USER_STATUS_LABELS,
  type User,
  type UserFormValues,
  type UserStatus,
} from "@/types/user";

type UserDetailModalProps = {
  user: User;
  open: boolean;
  onClose: () => void;
};

const statusClasses: Record<UserStatus, string> = {
  ACTIVE: "bg-success-bg text-success",
  PENDING: "bg-warning-bg text-warning",
  BLOCKED: "bg-error-bg text-error",
  INACTIVE: "bg-admin-surface-soft text-admin-text-soft",
};

function formatDate(value: string | null) {
  if (!value) {
    return "Sin registro";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getInitials(user: User) {
  const firstInitial = user.firstName.trim().charAt(0);
  const lastInitial = user.lastName.trim().charAt(0);

  return `${firstInitial}${lastInitial}`.toUpperCase();
}

function getFormValues(user: User): UserFormValues {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
  };
}

export default function UserDetailModal({
  user,
  open,
  onClose,
}: UserDetailModalProps) {
  const { updateUser } = useUsers();

  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState<UserFormValues>(
    getFormValues(user),
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setValues(getFormValues(user));
      setIsEditing(false);
      setErrorMessage("");
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [open, user]);

  const updateField = <Field extends keyof UserFormValues>(
    field: Field,
    value: UserFormValues[Field],
  ) => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const cancelEditing = () => {
    setValues(getFormValues(user));
    setErrorMessage("");
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!values.firstName.trim()) {
      setErrorMessage("Ingresa el nombre del usuario.");
      return;
    }

    if (!values.lastName.trim()) {
      setErrorMessage("Ingresa el apellido del usuario.");
      return;
    }

    if (!values.email.trim() || !values.email.includes("@")) {
      setErrorMessage("Ingresa un correo electrónico válido.");
      return;
    }

    if (!values.phone.trim()) {
      setErrorMessage("Ingresa el número de celular.");
      return;
    }

    try {
      updateUser(user.id, values);
      setIsEditing(false);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudieron guardar los cambios.",
      );
    }
  };

  const displayedRole = isEditing ? values.role : user.role;
  const displayedStatus = isEditing ? values.status : user.status;
  const displayedName = isEditing
    ? `${values.firstName} ${values.lastName}`.trim() || "Usuario"
    : user.fullName;

  return (
    <Modal
      open={open}
      title={isEditing ? "Editar usuario" : "Detalle del usuario"}
      description={
        isEditing
          ? "Actualiza la información y el acceso de la cuenta."
          : "Información general, acceso y estado de la cuenta."
      }
      size="lg"
      onClose={onClose}
      footer={
        isEditing ? (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={cancelEditing}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-admin-border bg-white px-5 text-sm font-bold text-admin-text transition-colors hover:bg-admin-surface-soft"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-accent px-5 text-sm font-bold text-ink transition-colors hover:bg-accent-dark"
            >
              Guardar cambios
            </button>
          </div>
        ) : (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-admin-border bg-white px-5 text-sm font-bold text-admin-text transition-colors hover:bg-admin-surface-soft"
            >
              Cerrar
            </button>

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-accent px-5 text-sm font-bold text-ink transition-colors hover:bg-accent-dark"
            >
              Editar usuario
            </button>
          </div>
        )
      }
    >
      <div className="p-5 sm:p-6">
        <section className="flex flex-col gap-5 rounded-2xl bg-admin-surface-soft p-5 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-bold text-ink">
            {getInitials({
              ...user,
              firstName: values.firstName,
              lastName: values.lastName,
            })}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl font-bold tracking-[-0.03em] text-admin-text">
                {displayedName}
              </h3>

              <span
                className={[
                  "inline-flex rounded-full px-3 py-1 text-xs font-bold",
                  statusClasses[displayedStatus],
                ].join(" ")}
              >
                {USER_STATUS_LABELS[displayedStatus]}
              </span>
            </div>

            <p className="mt-2 text-sm font-semibold text-admin-text-soft">
              {USER_ROLE_LABELS[displayedRole]}
            </p>
          </div>
        </section>

        {isEditing ? (
          <>
            <section className="mt-6">
              <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-admin-text-muted">
                Información personal
              </h3>

              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor={`firstName-${user.id}`}
                    className="mb-2 block text-sm font-semibold text-admin-text"
                  >
                    Nombre
                  </label>

                  <input
                    id={`firstName-${user.id}`}
                    type="text"
                    value={values.firstName}
                    onChange={(event) =>
                      updateField("firstName", event.target.value)
                    }
                    className="h-12 w-full rounded-xl border border-admin-border bg-white px-4 text-sm text-admin-text outline-none transition-colors focus:border-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`lastName-${user.id}`}
                    className="mb-2 block text-sm font-semibold text-admin-text"
                  >
                    Apellido
                  </label>

                  <input
                    id={`lastName-${user.id}`}
                    type="text"
                    value={values.lastName}
                    onChange={(event) =>
                      updateField("lastName", event.target.value)
                    }
                    className="h-12 w-full rounded-xl border border-admin-border bg-white px-4 text-sm text-admin-text outline-none transition-colors focus:border-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`email-${user.id}`}
                    className="mb-2 block text-sm font-semibold text-admin-text"
                  >
                    Correo electrónico
                  </label>

                  <input
                    id={`email-${user.id}`}
                    type="email"
                    value={values.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    className="h-12 w-full rounded-xl border border-admin-border bg-white px-4 text-sm text-admin-text outline-none transition-colors focus:border-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`phone-${user.id}`}
                    className="mb-2 block text-sm font-semibold text-admin-text"
                  >
                    Celular
                  </label>

                  <input
                    id={`phone-${user.id}`}
                    type="tel"
                    value={values.phone}
                    onChange={(event) =>
                      updateField("phone", event.target.value)
                    }
                    className="h-12 w-full rounded-xl border border-admin-border bg-white px-4 text-sm text-admin-text outline-none transition-colors focus:border-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`role-${user.id}`}
                    className="mb-2 block text-sm font-semibold text-admin-text"
                  >
                    Rol
                  </label>

                  <select
                    id={`role-${user.id}`}
                    value={values.role}
                    onChange={(event) =>
                      updateField(
                        "role",
                        event.target.value as UserFormValues["role"],
                      )
                    }
                    className="h-12 w-full rounded-xl border border-admin-border bg-white px-4 text-sm text-admin-text outline-none transition-colors focus:border-primary"
                  >
                    <option value="SUPER_ADMIN">
                      Administrador
                    </option>

                    <option value="GESTOR_PRESTAMOS">
                      Gestor de préstamos
                    </option>
                    <option value="JEFE_CARTERA">
                      Jefe de cartera
                    </option>
                    <option value="ASESOR_PRESTAMOS">
                      Asesor de préstamos
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor={`status-${user.id}`}
                    className="mb-2 block text-sm font-semibold text-admin-text"
                  >
                    Estado
                  </label>

                  <select
                    id={`status-${user.id}`}
                    value={values.status}
                    onChange={(event) =>
                      updateField(
                        "status",
                        event.target.value as UserFormValues["status"],
                      )
                    }
                    className="h-12 w-full rounded-xl border border-admin-border bg-white px-4 text-sm text-admin-text outline-none transition-colors focus:border-primary"
                  >
                    <option value="ACTIVE">Activo</option>
                    <option value="PENDING">Pendiente</option>
                    <option value="BLOCKED">Bloqueado</option>
                    <option value="INACTIVE">Inactivo</option>
                  </select>
                </div>
              </div>
            </section>

            {errorMessage ? (
              <div
                role="alert"
                className="mt-5 rounded-xl bg-error-bg px-4 py-3 text-sm font-semibold text-error"
              >
                {errorMessage}
              </div>
            ) : null}
          </>
        ) : (
          <>
            <section className="mt-6">
              <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-admin-text-muted">
                Información personal
              </h3>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <article className="rounded-xl border border-admin-border p-4">
                  <div className="flex items-center gap-3">
                    <Mail
                      aria-hidden="true"
                      size={18}
                      strokeWidth={1.8}
                      className="text-primary-dark"
                    />

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-admin-text-muted">
                        Correo electrónico
                      </p>

                      <p className="mt-1 truncate text-sm font-bold text-admin-text">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </article>

                <article className="rounded-xl border border-admin-border p-4">
                  <div className="flex items-center gap-3">
                    <Phone
                      aria-hidden="true"
                      size={18}
                      strokeWidth={1.8}
                      className="text-primary-dark"
                    />

                    <div>
                      <p className="text-xs font-semibold text-admin-text-muted">
                        Celular
                      </p>

                      <p className="mt-1 text-sm font-bold text-admin-text">
                        {user.phone}
                      </p>
                    </div>
                  </div>
                </article>

                <article className="rounded-xl border border-admin-border p-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck
                      aria-hidden="true"
                      size={18}
                      strokeWidth={1.8}
                      className="text-accent-dark"
                    />

                    <div>
                      <p className="text-xs font-semibold text-admin-text-muted">
                        Rol asignado
                      </p>

                      <p className="mt-1 text-sm font-bold text-admin-text">
                        {USER_ROLE_LABELS[user.role]}
                      </p>
                    </div>
                  </div>
                </article>

                <article className="rounded-xl border border-admin-border p-4">
                  <div className="flex items-center gap-3">
                    <UserRound
                      aria-hidden="true"
                      size={18}
                      strokeWidth={1.8}
                      className="text-accent-dark"
                    />

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-admin-text-muted">
                        Identificador
                      </p>

                      <p className="mt-1 truncate text-sm font-bold text-admin-text">
                        {user.id}
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            <section className="mt-6">
              <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-admin-text-muted">
                Actividad de la cuenta
              </h3>

              <div className="mt-3 divide-y divide-admin-border rounded-xl border border-admin-border">
                <div className="flex items-start gap-3 px-4 py-4">
                  <CalendarDays
                    aria-hidden="true"
                    size={18}
                    strokeWidth={1.8}
                    className="mt-0.5 text-primary-dark"
                  />

                  <div>
                    <p className="text-xs font-semibold text-admin-text-muted">
                      Último acceso
                    </p>

                    <p className="mt-1 text-sm font-bold text-admin-text">
                      {formatDate(user.lastAccess)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 px-4 py-4">
                  <CalendarDays
                    aria-hidden="true"
                    size={18}
                    strokeWidth={1.8}
                    className="mt-0.5 text-primary-dark"
                  />

                  <div>
                    <p className="text-xs font-semibold text-admin-text-muted">
                      Cuenta creada
                    </p>

                    <p className="mt-1 text-sm font-bold text-admin-text">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 px-4 py-4">
                  <CalendarDays
                    aria-hidden="true"
                    size={18}
                    strokeWidth={1.8}
                    className="mt-0.5 text-primary-dark"
                  />

                  <div>
                    <p className="text-xs font-semibold text-admin-text-muted">
                      Última actualización
                    </p>

                    <p className="mt-1 text-sm font-bold text-admin-text">
                      {formatDate(user.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </Modal>
  );
}
